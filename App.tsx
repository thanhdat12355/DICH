
import React, { useState, useRef } from 'react';
import { 
  ArrowRightLeft, 
  Loader2, 
  Copy, 
  Check, 
  ArrowRight, 
  Volume2, 
  Globe, 
  Image as ImageIcon,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { translateAndSearch } from './services/api';
import { LoadingState, TranslationDirection, RelatedTerm } from './types';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [mainPartOfSpeech, setMainPartOfSpeech] = useState('');
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
      setMainPartOfSpeech(result.mainPartOfSpeech || '');
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
    setMainPartOfSpeech('');
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

  const getPosColor = (pos: string) => {
    const p = pos.toLowerCase();
    if (p.includes('danh từ')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (p.includes('động từ')) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (p.includes('tính từ')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (p.includes('trạng từ')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Translator Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden transition-all">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex-1 p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  {direction === 'vi-de' ? 'Tiếng Việt' : 'Tiếng Đức'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                  Enter to Translate
                </span>
              </div>
              <textarea
                ref={textareaRef}
                className="w-full h-48 resize-none border-none focus:ring-0 text-2xl text-slate-800 placeholder-slate-200 outline-none font-medium leading-relaxed"
                placeholder="Nhập nội dung cần dịch..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="flex-1 p-8 bg-slate-50/40">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-4 py-1.5 bg-blue-100 rounded-full text-[11px] font-black text-blue-600 uppercase tracking-widest">
                    {direction === 'vi-de' ? 'Tiếng Đức' : 'Tiếng Việt'}
                  </span>
                  {mainPartOfSpeech && status !== LoadingState.LOADING && (
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest shadow-sm ${getPosColor(mainPartOfSpeech)}`}>
                      {mainPartOfSpeech}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  {translatedText && (
                    <>
                      <button onClick={() => handleSpeak(translatedText, direction === 'vi-de' ? 'de-DE' : 'vi-VN')} className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm hover:shadow">
                        <Volume2 className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={copyToClipboard} className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm hover:shadow">
                        {copied ? <Check className="w-4.5 h-4.5 text-green-500" /> : <Copy className="w-4.5 h-4.5" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="h-48 overflow-y-auto custom-scrollbar">
                {status === LoadingState.LOADING ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                      <div className="absolute inset-0 blur-xl bg-blue-400/20 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-[11px] font-black text-slate-400 animate-pulse uppercase tracking-widest">Đang phân tích ngữ cảnh...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-slate-900 leading-snug whitespace-pre-wrap">
                      {translatedText || <span className="text-slate-200 font-normal italic">Kết quả dịch thuật...</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
            <button onClick={handleSwap} className="group flex items-center gap-2.5 text-xs font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-tighter">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-blue-200 transition-colors">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              Đảo ngôn ngữ
            </button>
            <button
              onClick={handleTranslate}
              disabled={!inputText.trim() || status === LoadingState.LOADING}
              className="px-12 py-4.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-200 flex items-center gap-3 transform active:scale-95 hover:-translate-y-0.5"
            >
              {status === LoadingState.LOADING ? 'ĐANG XỬ LÝ' : 'DỊCH NGAY'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {explanation && (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Ghi chú Ngôn ngữ & Văn hóa</h3>
                <div className="h-1 w-12 bg-indigo-500 rounded-full mt-1"></div>
              </div>
            </div>
            <p className="text-slate-600 leading-loose text-lg whitespace-pre-wrap font-medium">{explanation}</p>
          </div>
        )}

        {/* Visual Vocabulary Grid */}
        <div className={`${relatedTerms.length === 0 && status !== LoadingState.LOADING ? 'hidden' : 'block'} animate-fade-in`}>
          <div className="flex items-end justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-2xl uppercase tracking-tight">Từ vựng trực quan</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">10 từ vựng quan trọng kèm hình ảnh</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {status === LoadingState.LOADING ? (
               Array.from({length: 4}).map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse opacity-50"></div>
               ))
            ) : (
              relatedTerms.map((item, idx) => (
                <div key={idx} className="group relative bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-blue-100 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors duration-500 -z-10"></div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-5">
                      <div className="mt-1">
                        <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 text-[13px] font-black text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-google-sans font-extrabold text-slate-900 text-2xl tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                              {item.term}
                            </h4>
                            <button 
                              onClick={() => handleSpeak(item.term, 'de-DE')} 
                              className="p-1.5 text-slate-300 hover:text-blue-500 transition-all hover:bg-blue-50 rounded-lg"
                              title="Nghe phát âm"
                            >
                              <Volume2 className="w-5 h-5" />
                            </button>
                          </div>
                          <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPosColor(item.partOfSpeech)}`}>
                            {item.partOfSpeech}
                          </span>
                        </div>
                        
                        <div className="relative pl-4 border-l-2 border-slate-100 group-hover:border-blue-100 transition-colors">
                          <p className="text-xl text-slate-700 font-bold leading-tight">
                            {item.meaning}
                          </p>
                        </div>
                      </div>
                    </div>

                    <a 
                      href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(item.term)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="group/btn flex flex-col items-center gap-1.5 p-4 bg-slate-50 hover:bg-blue-600 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-blue-200 transform group-hover:scale-105"
                      title="Xem hình ảnh thực tế trên Google"
                    >
                      <ImageIcon className="w-6 h-6 text-slate-400 group-hover/btn:text-white transition-colors" />
                      <span className="text-[9px] font-black text-slate-400 group-hover/btn:text-white uppercase tracking-tighter">Images</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-12 mt-8 text-center border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
        </div>
        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
          Viet-Ger Visual Translator • 2024
        </p>
        <p className="text-slate-300 text-[10px] mt-2 font-medium">
          Học tiếng Đức nhanh hơn thông qua liên tưởng hình ảnh
        </p>
      </footer>
    </div>
  );
};

export default App;
