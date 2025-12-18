
import React, { useState, useRef } from 'react';
import { 
  ArrowRightLeft, 
  Loader2, 
  Copy, 
  Check, 
  ArrowRight, 
  Search, 
  Volume2, 
  Globe, 
  Image as ImageIcon,
  BookOpen
} from 'lucide-react';
import { translateAndSearch } from './services/api';
import { LoadingState, TranslationDirection, RelatedTerm } from './types';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [explanation, setExplanation] = useState(''); 
  const [relatedTerms, setRelatedTerms] = useState<RelatedTerm[]>([]);
  const [direction, setDirection] = useState<TranslationDirection>('vi-de');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [copied, setCopied] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setStatus(LoadingState.LOADING);
    try {
      const result = await translateAndSearch(inputText, direction);
      setTranslatedText(result.translatedText);
      setExplanation(result.explanation || '');
      setRelatedTerms(result.relatedTerms || []);
      setStatus(LoadingState.SUCCESS);
    } catch (err) {
      setStatus(LoadingState.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newValue = inputText.substring(0, start) + "\n" + inputText.substring(end);
      setInputText(newValue);

      setTimeout(() => {
        if (target) {
          target.selectionStart = target.selectionEnd = start + 1;
        }
      }, 0);
    }
  };

  const handleSwap = () => {
    setDirection(prev => prev === 'vi-de' ? 'de-vi' : 'vi-de');
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleSpeak = (text: string, lang: 'de-DE' | 'vi-VN') => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Translator Grid */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex-1 p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                  {direction === 'vi-de' ? 'Tiếng Việt' : 'Tiếng Đức'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  Enter để dịch • Tab để xuống dòng
                </span>
              </div>
              <textarea
                ref={textareaRef}
                className="w-full h-48 resize-none border-none focus:ring-0 text-2xl text-slate-800 placeholder-slate-200 outline-none font-medium"
                placeholder="Gõ nội dung cần dịch..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="flex-1 p-8 bg-slate-50/50">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 bg-blue-100 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                  {direction === 'vi-de' ? 'Tiếng Đức' : 'Tiếng Việt'}
                </span>
                <div className="flex gap-2">
                  {translatedText && (
                    <>
                      <button onClick={() => handleSpeak(translatedText, direction === 'vi-de' ? 'de-DE' : 'vi-VN')} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-blue-500 transition-colors">
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button onClick={copyToClipboard} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-blue-500 transition-colors">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="h-48 overflow-y-auto">
                {status === LoadingState.LOADING ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">Đang xử lý</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-slate-900 leading-tight whitespace-pre-wrap">
                    {translatedText || <span className="text-slate-200 font-normal italic">Kết quả sẽ hiện ở đây...</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button onClick={handleSwap} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowRightLeft className="w-4 h-4" /> Đảo ngôn ngữ
            </button>
            <button
              onClick={handleTranslate}
              disabled={!inputText.trim() || status === LoadingState.LOADING}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-200 flex items-center gap-3 transform active:scale-95"
            >
              {status === LoadingState.LOADING ? 'ĐANG DỊCH...' : 'DỊCH NGAY'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {explanation && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Ghi chú Ngôn ngữ & Văn hóa</h3>
            </div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{explanation}</p>
          </div>
        )}

        {/* Visual Vocabulary */}
        <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 animate-fade-in ${relatedTerms.length === 0 && status !== LoadingState.LOADING ? 'hidden' : 'block'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-xl text-green-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-black text-slate-800 text-xl uppercase tracking-tight">Từ vựng trực quan (10 từ)</h3>
            </div>
            {relatedTerms.length > 0 && (
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                Nhấn vào icon ảnh để xem 10+ kết quả thực tế
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {status === LoadingState.LOADING && (
               <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-40">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            )}

            {relatedTerms.map((item, idx) => (
              <div key={idx} className="group relative bg-slate-50 rounded-2xl p-5 border border-transparent hover:border-blue-200 hover:bg-white transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-200 text-[12px] font-black text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h4 className="font-google-sans font-bold text-slate-900 text-xl group-hover:text-blue-600 tracking-tight leading-none">
                              {item.term}
                            </h4>
                            <button onClick={() => handleSpeak(item.term, 'de-DE')} className="text-slate-300 hover:text-blue-500 transition-colors p-1">
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest mt-1">
                            {item.partOfSpeech}
                          </span>
                        </div>
                      </div>
                      <p className="text-base text-slate-600 font-semibold mt-2">{item.meaning}</p>
                    </div>
                  </div>
                  <a 
                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(item.term)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-white rounded-xl text-slate-300 hover:text-blue-500 hover:shadow-lg transition-all transform hover:-translate-y-1"
                    title="Xem 10+ hình ảnh thực tế"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <footer className="py-8 text-center text-slate-400 text-xs font-medium">
        © 2024 Viet-Ger Visual Translator • Học tiếng Đức qua ngữ cảnh
      </footer>
    </div>
  );
};

export default App;
