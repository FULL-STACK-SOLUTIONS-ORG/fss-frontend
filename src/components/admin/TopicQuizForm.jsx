import React, { useState } from 'react';

const TopicQuizForm = ({ quizzes, onChange }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleAddQuiz = () => {
    const newQuiz = { question: '', questionCode: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', sampleCode: '' };
    onChange([...quizzes, newQuiz]);
    setExpandedIndex(quizzes.length);
  };

  const handleRemoveQuiz = (index) => {
    const newQuizzes = quizzes.filter((_, i) => i !== index);
    onChange(newQuizzes);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const handleQuizChange = (index, field, value) => {
    const newQuizzes = [...quizzes];
    newQuizzes[index] = { ...newQuizzes[index], [field]: value };
    onChange(newQuizzes);
  };

  const handleOptionChange = (quizIndex, optionIndex, value) => {
    const newQuizzes = [...quizzes];
    const newOptions = [...newQuizzes[quizIndex].options];
    newOptions[optionIndex] = value;
    newQuizzes[quizIndex] = { ...newQuizzes[quizIndex], options: newOptions };
    onChange(newQuizzes);
  };

  const inputCls = "w-full px-3 py-2 border border-[#D4C9B8] rounded-lg focus:ring-0 focus:border-[#9B7D43] bg-white text-[#1C1A17] text-sm outline-none";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-[#9B7D43]">Topic Quizzes</label>
        <button
          type="button"
          onClick={handleAddQuiz}
          className="text-xs px-3 py-1 bg-[#9B7D43]/10 text-[#9B7D43] rounded-lg hover:bg-[#9B7D43]/20 transition-colors border border-[#9B7D43]/30"
        >
          + Add Question
        </button>
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-4 bg-[#FAF7F2] rounded-lg border border-[#D4C9B8] border-dashed">
          <p className="text-sm text-[#9A8A7A]">No quizzes added yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {quizzes.map((quiz, index) => (
          <div key={index} className="bg-[#FAF7F2] rounded-lg border border-[#D4C9B8] overflow-hidden">
            <div
              className="px-4 py-3 flex items-center justify-between bg-white cursor-pointer hover:bg-[#FAF7F2] transition-colors"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#9B7D43]/10 text-[#9B7D43] text-xs flex items-center justify-center font-bold border border-[#9B7D43]/30">
                  {index + 1}
                </span>
                <span className="text-sm text-[#1C1A17] font-medium truncate max-w-[200px]">
                  {quiz.question || 'New Question'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveQuiz(index); }}
                  className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                  title="Remove Question"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg
                  className={`w-4 h-4 text-[#5A5550] transition-transform duration-200 ${expandedIndex === index ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {expandedIndex === index && (
              <div className="p-4 space-y-4 border-t border-[#D4C9B8]">
                <div>
                  <label className="block text-xs font-medium text-[#5A5550] mb-1">Question</label>
                  <input
                    type="text"
                    value={quiz.question}
                    onChange={(e) => handleQuizChange(index, 'question', e.target.value)}
                    className={inputCls}
                    placeholder="Enter quiz question"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5A5550] mb-1">Question Code Snippet (Optional)</label>
                  <textarea
                    value={quiz.questionCode || ''}
                    onChange={(e) => handleQuizChange(index, 'questionCode', e.target.value)}
                    className={`${inputCls} font-mono min-h-[80px]`}
                    placeholder="// Add code snippet for the question..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#5A5550]">Options</label>
                  {quiz.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-2 items-center">
                      <input
                        type="radio"
                        checked={quiz.correctAnswer === optIndex}
                        onChange={() => handleQuizChange(index, 'correctAnswer', optIndex)}
                        className="mt-1 flex-shrink-0 cursor-pointer text-[#9B7D43] focus:ring-[#9B7D43] border-[#D4C9B8]"
                        name={`correctAnswer-${index}`}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                        className={`flex-1 ${inputCls}`}
                        placeholder={`Option ${optIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5A5550] mb-1">Explanation</label>
                  <textarea
                    value={quiz.explanation}
                    onChange={(e) => handleQuizChange(index, 'explanation', e.target.value)}
                    className={`${inputCls} min-h-[80px]`}
                    placeholder="Explain why the answer is correct..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5A5550] mb-1">Sample Code (Optional)</label>
                  <textarea
                    value={quiz.sampleCode || ''}
                    onChange={(e) => handleQuizChange(index, 'sampleCode', e.target.value)}
                    className={`${inputCls} font-mono min-h-[100px]`}
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
