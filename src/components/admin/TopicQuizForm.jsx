import React, { useState } from 'react';const TopicQuizForm = ({ quizzes, onChange }) => {  const [expandedIndex, setExpandedIndex] = useState(null);  const handleAddQuiz = () => {    const newQuiz = {      question: '',
      questionCode: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      sampleCode: ''
    };    onChange([...quizzes, newQuiz]);    setExpandedIndex(quizzes.length);   };  const handleRemoveQuiz = (index) => {    const newQuizzes = quizzes.filter((_, i) => i !== index);    onChange(newQuizzes);    if (expandedIndex === index) setExpandedIndex(null);  };  const handleQuizChange = (index, field, value) => {    const newQuizzes = [...quizzes];    newQuizzes[index] = { ...newQuizzes[index], [field]: value };    onChange(newQuizzes);  };  const handleOptionChange = (quizIndex, optionIndex, value) => {    const newQuizzes = [...quizzes];    const newOptions = [...newQuizzes[quizIndex].options];    newOptions[optionIndex] = value;    newQuizzes[quizIndex] = { ...newQuizzes[quizIndex], options: newOptions };    onChange(newQuizzes);  };  return (    <div className="space-y-4">      <div className="flex items-center justify-between">        <label className="block text-sm font-semibold text-teal-400">Topic Quizzes</label>        <button          type="button"          onClick={handleAddQuiz}          className="text-xs px-3 py-1 bg-teal-600/20 text-teal-400 rounded-lg hover:bg-teal-600/30 transition-colors border border-teal-600/30"        >          + Add Question        </button>      </div>      {quizzes.length === 0 && (        <div className="text-center py-4 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">          <p className="text-sm text-slate-500">No quizzes added yet.</p>        </div>
      )}
      <div className="space-y-3">
        {quizzes.map((quiz, index) => (
          <div key={index} className="bg-slate-700/50 rounded-lg border border-slate-700 overflow-hidden">
            {}
            <div
              className="px-4 py-3 flex items-center justify-between bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <span className="text-sm text-white font-medium truncate max-w-[200px]">
                  {quiz.question || 'New Question'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveQuiz(index);
                  }}
                  className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-red-400/10 transition-colors"
                  title="Remove Question"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {}
            {expandedIndex === index && (
              <div className="p-4 space-y-4 border-t border-slate-700 animate-fadeIn">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Question</label>
                  <input
                    type="text"
                    value={quiz.question}
                    onChange={(e) => handleQuizChange(index, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-0 focus:border-teal-500 bg-slate-800 text-white text-sm"
                    placeholder="Enter quiz question"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Question Code Snippet (Optional)</label>
                  <textarea
                    value={quiz.questionCode || ''}
                    onChange={(e) => handleQuizChange(index, 'questionCode', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-0 focus:border-teal-500 bg-slate-800 text-white text-sm font-mono min-h-[80px]"
                    placeholder="// Add code snippet for the question..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-400">Options</label>
                  {quiz.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-2 items-center">
                      <input
                        type="radio"
                        checked={quiz.correctAnswer === optIndex}
                        onChange={() => handleQuizChange(index, 'correctAnswer', optIndex)}
                        className="mt-1 flex-shrink-0 cursor-pointer text-teal-600 focus:ring-teal-500 bg-slate-800 border-slate-600"
                        name={`correctAnswer-${index}`}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-600 rounded-lg focus:ring-0 focus:border-teal-500 bg-slate-800 text-white text-sm"
                        placeholder={`Option ${optIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Explanation</label>
                  <textarea
                    value={quiz.explanation}
                    onChange={(e) => handleQuizChange(index, 'explanation', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-0 focus:border-teal-500 bg-slate-800 text-white text-sm min-h-[80px]"
                    placeholder="Explain why the answer is correct..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Sample Code (Optional)</label>
                  <textarea
                    value={quiz.sampleCode || ''}
                    onChange={(e) => handleQuizChange(index, 'sampleCode', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-0 focus:border-teal-500 bg-slate-800 text-white text-sm font-mono min-h-[100px]"
                    placeholder="// Paste sample code here..."
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default TopicQuizForm;