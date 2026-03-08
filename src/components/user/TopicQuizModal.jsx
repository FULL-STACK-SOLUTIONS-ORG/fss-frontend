import React, { useState, useEffect } from "react";
import api from "../../services/api";
import AnimatedCoin from "../common/AnimatedCoin";
const TopicQuizModal = ({
  isOpen,
  onClose,
  quizzes,
  moduleId,
  topicId,
  topicTitle,
  userAttempts = [],
  onBadgeEarned,
  onPointsUpdate,
  onQuizAttempt
}) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [localAttempts, setLocalAttempts] = useState(userAttempts);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(null);
  const [showCode, setShowCode] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setCurrentQuizIndex(0);
      resetState(0);
    }
  }, [isOpen]);
  useEffect(() => {
    setLocalAttempts(userAttempts);
  }, [userAttempts]);
  useEffect(() => {
    resetState(currentQuizIndex);
  }, [currentQuizIndex, localAttempts]);
  const currentQuiz = quizzes && quizzes[currentQuizIndex];
  const resetState = (index) => {
    if (!quizzes || !quizzes[index]) return;
    if (!quizzes || !quizzes[index]) return;
    const quizId = quizzes[index]._id;
    const attempt = localAttempts.find((a) => a.quizId.toString() === quizId.toString());
    if (attempt) {
      setSelectedOption(null);
      setIsCorrect(attempt.isCorrect);
      setShowExplanation(true);
    } else {
      setSelectedOption(null);
      setShowExplanation(false);
      setShowCode(false);
      setIsCorrect(false);
    }
  };
  if (!isOpen || !currentQuiz) return null;
  const handleOptionClick = async (index) => {
    if (showExplanation || isSubmitting) return;
    setSelectedOption(index);
    setIsSubmitting(true);
    const correct = index === currentQuiz.correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true); // Optimistic Update

    try {
      const response = await api.progress.submitQuizAttempt({
        moduleId,
        topicId,
        quizId: currentQuiz._id,
        isCorrect: correct,
      });
      setLocalAttempts((prev) => [
        ...prev,
        {
          moduleId,
          topicId,
          quizId: currentQuiz._id,
          isCorrect: correct,
        },
      ]);
      if (onQuizAttempt) {
        onQuizAttempt({
          moduleId,
          topicId,
          quizId: currentQuiz._id,
          isCorrect: correct,
          attemptedAt: new Date()
        });
      }
      if (correct && response.data?.pointsAwarded) {
        setEarnedPoints(response.data.pointsAwarded);
        if (onPointsUpdate) {
            onPointsUpdate(response.data.pointsAwarded);
        }
        setTimeout(() => setEarnedPoints(null), 3000);
      }
      if (response.data?.newBadges && response.data.newBadges.length > 0 && onBadgeEarned) {
          // Trigger for the first new badge
          onBadgeEarned(response.data.newBadges[0]);
      }
    } catch (error) {
      console.error("Failed to submit quiz attempt:", error);
      // Fallback: If strict accuracy is required, we could hide explanation here but 
      // generally we just let it stay as "attempted".
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleNext = () => {
    setEarnedPoints(null);
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };
  const handlePrevious = () => {
    setEarnedPoints(null);
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex((prev) => prev - 1);
    }
  };
  const handleClose = () => {
    onClose();
  };
  const isLastQuestion = currentQuizIndex === quizzes.length - 1;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-700 overflow-hidden animate-scaleIn flex flex-col max-h-[90vh] min-h-[600px] relative">
        {}
        <div className="bg-slate-900/50 p-6 border-b border-slate-700 flex justify-between items-center gap-4 min-h-[88px]">
          <div>
            <div className="flex items-center gap-3">
              {earnedPoints && (
                <div className="animate-slide-up flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-xl border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
                  <AnimatedCoin className="w-6 h-6" textSize="text-xs" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 font-extrabold text-sm whitespace-nowrap drop-shadow-sm">
                    +{earnedPoints}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-bold border border-slate-600">
              {currentQuizIndex + 1} / {quizzes.length}
            </span>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-lg p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        {}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="mb-5">
            <h4 className="text-sm md:text-base font-medium text-slate-200 leading-relaxed">
              {currentQuiz.question}
            </h4>
            {currentQuiz.questionCode && (
              <div className="mt-3 mb-4 bg-slate-950 rounded-lg border border-slate-700 p-3 font-mono text-xs md:text-sm text-slate-300 overflow-x-auto shadow-inner">
                <pre className="whitespace-pre-wrap">{currentQuiz.questionCode}</pre>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {currentQuiz.options.map((option, index) => {
              let optionClass =
                "w-full py-2 px-3 rounded-lg border text-left transition-all duration-200 flex items-center justify-between group ";
              const isUserSelected = index === selectedOption;
              const isCorrectAnswer = index === currentQuiz.correctAnswer;
              if (showExplanation) {
                if (isCorrectAnswer) {
                  optionClass +=
                    "bg-green-500/10 border-green-500 text-green-100";
                } else if (isUserSelected && !isCorrectAnswer) {
                  optionClass +=
                    "bg-red-500/10 border-red-500 text-red-100 opacity-60";
                } else {
                  optionClass +=
                    "bg-slate-800 border-slate-700 text-slate-400 opacity-50";
                }
              } else {
                optionClass += "bg-slate-800 border-slate-700 text-slate-300";
              }
              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  disabled={showExplanation || isSubmitting}
                  className={optionClass}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                        showExplanation
                          ? isCorrectAnswer
                            ? "bg-green-500 border-green-400 text-white"
                            : isUserSelected && !isCorrectAnswer
                              ? "bg-red-500 border-red-400 text-white"
                              : "border-slate-600 text-slate-500"
                          : "border-slate-600 text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm">{option}</span>
                  </div>
                  {showExplanation && isCorrectAnswer && (
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {showExplanation && isUserSelected && !isCorrectAnswer && (
                    <svg
                      className="w-6 h-6 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          {}
          {showExplanation ? (
            <div
              className={`mt-6 p-5 rounded-xl border ${
                isCorrect
                  ? "bg-green-900/20 border-green-900/50"
                  : "bg-red-900/20 border-red-900/50"
              } animate-fadeIn`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 p-2 rounded-lg ${isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {isCorrect ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h5
                    className={`font-bold mb-1 text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}
                  >
                    {isCorrect ? "Nicely done!" : "Incorrect"}
                  </h5>
                  {!isCorrect && (
                    <p className="text-slate-400 text-xs mb-2">
                      The correct answer is highlighted in green.
                    </p>
                  )}
                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                    {currentQuiz.explanation || "No explanation provided."}
                  </p>
                  
                  {currentQuiz.sampleCode && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowCode(!showCode)}
                        className="flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors mb-2 group"
                      >
                        <svg 
                          className={`w-5 h-5 transition-transform duration-300 ${showCode ? 'rotate-90' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span>{showCode ? 'Hide Sample Code' : 'View Sample Code'}</span>
                        <span className="text-xs font-normal text-slate-500 group-hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          (Click to expand)
                        </span>
                      </button>
                      
                      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showCode ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-slate-950 rounded-lg border border-slate-700 p-4 font-mono text-xs md:text-sm text-slate-300 overflow-x-auto shadow-inner relative group/code">
                          <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                             <button 
                               onClick={() => navigator.clipboard.writeText(currentQuiz.sampleCode)}
                               className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors"
                               title="Copy code"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                               </svg>
                             </button>
                          </div>
                          <pre className="whitespace-pre-wrap">{currentQuiz.sampleCode}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-5 rounded-xl border border-slate-800/50 bg-slate-900/20 min-h-[140px] flex items-center justify-center"></div>
          )}
        </div>
        {}
        {}
        <div className="bg-slate-900/80 p-6 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuizIndex === 0}
            className={`px-5 py-2 text-sm text-slate-300 rounded-xl font-semibold transition-all border border-slate-600 ${
              currentQuizIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-slate-700 hover:text-white hover:scale-105 active:scale-95"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-5 py-2 text-sm bg-teal-600 text-white rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-teal-900/20"
          >
            {isLastQuestion ? "Finish Quiz" : "Next Question"}
          </button>
        </div>
        <style>{`
          @keyframes slide-up {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};
export default TopicQuizModal;
