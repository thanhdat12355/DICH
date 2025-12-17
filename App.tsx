import React, { useState } from 'react';
import { ArrowRightLeft, Loader2, Copy, Check, ArrowRight, BookOpen, Search, Volume2 } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setStatus(LoadingState.LOADING);
    setTranslatedText('');
    setExplanation('');
    setRelatedTerms([]);
    setErrorMsg('');

    try {
      const result = await translateAndSearch(inputText, direction);
      
      setTranslatedText(result.translatedText);
      setExplanation(result.explanation || '');
      setRelatedTerms(result.relatedTerms || []);
      setStatus(LoadingState.SUCCESS);
      
    } catch (err) {
      console.error(err);
      setStatus(LoadingState.ERROR);
      setErrorMsg('Dịch vụ đang bận hoặc mất kết nối. Vui lòng thử lại.');
    }
  };

  const handleSwap = () => {
    setDirection(prev => prev === 'vi-de' ? 'de-vi' : 'vi-de');
    
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText(inputText); 
      setExplanation(''); 
      setRelatedTerms([]);
    } else {
      setInputText('');
      setTranslatedText('');
      setExplanation('');
      setRelatedTerms([]);
    }
    
    setStatus(LoadingState.IDLE);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const openGoogleImages = (query: string) => {
    if (!query) return;
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, langCode: 'de-DE' | 'vi-VN') => {
    if (!text) return;
    // Cancel any current speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9; // Slightly slower for better clarity
    window.speechSynthesis.speak(utterance);
  };

  const isViToDe = direction === 'vi-de';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Language Control Bar */}
        <div className="flex items-center justify-center bg-white p-2 rounded-xl shadow-sm border border-gray-200 gap-4 mb-2">
           <span className={`text-sm font-semibold ${isViToDe ? 'text-blue-600' : 'text-gray-500'}`}>
             Vietnamese
           </span>
           <button 
             onClick={handleSwap}
             className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
             title="Swap languages"
           >
             <ArrowRightLeft className={`w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors ${!isViToDe ? 'rotate-180' : ''}`} />
           </button>
           <span className={`text-sm font-semibold ${!isViToDe ? 'text-blue-600' : 'text-gray-500'}`}>
             German
           </span>
        </div>

        {/* Translation Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
           <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 min-h-[20rem]">
              
              {/* Input Section */}
              <div className="p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {isViToDe ? 'Vietnamese (Input)' : 'German (Input)'}
                  </span>
                </div>
                <textarea
                  className="flex-grow w-full resize-none border-none focus:ring-0 text-xl text-gray-800 placeholder-gray-300 p-0 leading-relaxed outline-none bg-transparent"
                  placeholder="Nhập văn bản..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={1000}
                  autoFocus
                />
                <div className="mt-4 flex justify-between items-center text-gray-400">
                   <div className="flex items-center gap-2">
                     {inputText && (
                       <button onClick={() => setInputText('')} className="text-xs hover:text-gray-600 font-medium">Xóa</button>
                     )}
                     {/* Input Speaker - Show if input is German OR just to be helpful */}
                     {inputText && (
                       <button 
                        onClick={() => handleSpeak(inputText, isViToDe ? 'vi-VN' : 'de-DE')}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
                        title="Nghe phát âm"
                       >
                         <Volume2 className="w-4 h-4" />
                       </button>
                     )}
                   </div>
                   <span className="text-xs ml-auto">{inputText.length}/1000</span>
                </div>
              </div>

              {/* Output Section */}
              <div className="p-6 flex flex-col bg-gray-50/30 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {isViToDe ? 'German (Result)' : 'Vietnamese (Result)'}
                  </span>
                  <div className="flex items-center gap-1">
                    {status === LoadingState.SUCCESS && (
                       <>
                         <button 
                           onClick={() => handleSpeak(translatedText, isViToDe ? 'de-DE' : 'vi-VN')}
                           className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-500 hover:text-blue-600"
                           title="Nghe phát âm"
                         >
                           <Volume2 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={copyToClipboard}
                           className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-500"
                           title="Sao chép bản dịch"
                         >
                           {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                         </button>
                       </>
                    )}
                  </div>
                </div>
                
                <div className="flex-grow relative flex flex-col justify-center">
                  {status === LoadingState.LOADING ? (
                    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                      <div className="text-sm font-medium text-blue-600 animate-pulse">
                        AI đang suy nghĩ...
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-xl text-gray-900 leading-relaxed font-medium h-full flex flex-col justify-start">
                        {translatedText || <span className="text-gray-400 italic font-normal mt-10 text-center">Bản dịch sẽ hiện ở đây...</span>}
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-3">
                   {/* Translate Button */}
                   <button
                    onClick={handleTranslate}
                    disabled={!inputText.trim() || status === LoadingState.LOADING}
                    className={`
                      flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-sm w-full justify-center
                      ${!inputText.trim() || status === LoadingState.LOADING
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95'
                      }
                    `}
                  >
                    {status === LoadingState.LOADING ? 'Đang dịch...' : (
                      <>
                        Dịch ngay <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
           </div>
        </section>

        {/* Dedicated Cultural/Linguistic Note Section */}
        {explanation && status === LoadingState.SUCCESS && (
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 flex flex-col items-start gap-4 animate-fade-in ring-1 ring-indigo-50">
            <div className="flex items-start gap-4 w-full">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
                 <BookOpen className="w-6 h-6" />
               </div>
               <div className="flex-grow">
                 <div className="flex items-center gap-2 mb-2">
                   <h3 className="text-base font-bold text-gray-900">
                     Góc nhìn Văn hóa & Ngôn ngữ
                   </h3>
                   <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                     AI Context
                   </span>
                 </div>
                 <p className="text-gray-600 leading-7 text-sm sm:text-base">
                   {explanation}
                 </p>
               </div>
            </div>

            {/* Related Visual Terms - Displayed below the note */}
            {relatedTerms.length > 0 && (
              <div className="w-full mt-2 pl-0 sm:pl-[3.25rem]">
                <div className="pt-4 border-t border-dashed border-indigo-100">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide block mb-3">
                    Tham khảo hình ảnh & Phát âm (Đức)
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {relatedTerms.map((item, index) => (
                      <div
                        key={index}
                        className="group flex items-center bg-indigo-50/50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-300 rounded-lg transition-all text-sm text-gray-700 overflow-hidden pl-1"
                      >
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             handleSpeak(item.term, 'de-DE');
                           }}
                           className="p-1.5 hover:bg-white/60 rounded-md text-indigo-400 hover:text-indigo-700 transition-colors"
                           title="Nghe phát âm"
                         >
                           <Volume2 className="w-3.5 h-3.5" />
                         </button>
                         <div className="w-px h-4 bg-indigo-200 mx-1"></div>
                         <button 
                           onClick={() => openGoogleImages(item.term)}
                           className="flex items-center gap-2 py-1.5 pr-3 pl-1"
                           title={`Xem hình ảnh cho '${item.term}'`}
                         >
                           <Search className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-700" />
                           <span className="font-medium text-indigo-900">{item.term}</span>
                           <span className="text-gray-400 group-hover:text-indigo-400 text-xs border-l border-indigo-200 pl-2 ml-1">
                            {item.meaning}
                           </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Error Message */}
        {status === LoadingState.ERROR && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-fade-in">
            <span className="font-bold">Lỗi:</span> {errorMsg}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;