// import { GoogleGenerativeAI } from '@google/generative-ai';

// // Initialize Gemini AI
// const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// // NOTE: AI integration temporarily disabled for development
// // Teammate will enable this later - currently using enhanced sample questions

// console.log('Gemini API Key loaded:', API_KEY ? 'Yes (length: ' + API_KEY.length + ')' : 'No');

// if (!API_KEY) {
//     console.warn('Gemini API key not found. Please add REACT_APP_GEMINI_API_KEY to your .env file');
// }

// const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// export const geminiService = {
//     async generateQuestions(paragraph, questionCount, questionType) {
//         // For now, always use sample questions while teammate works on AI integration
//         console.log(`📝 Generating ${questionCount} sample questions of type: ${questionType}`);
//         console.log('ℹ️ AI integration temporarily disabled - using enhanced sample questions');
        
//         return this.generateFallbackQuestions(questionType, questionCount);

//         /* Temporarily commented out - AI integration for teammate to work on
//         try {
//             // Check if API key exists
//             if (!API_KEY || API_KEY.trim() === '') {
//                 console.log('No API key found, using fallback questions');
//                 return this.generateFallbackQuestions(questionType, questionCount);
//             }

//             console.log('🤖 Using Gemini AI to generate real questions...');
//             const prompt = this.buildSimplePrompt(paragraph, questionCount, questionType);
            
//             try {
//                 console.log('🔄 Generating questions with Gemini 2.0 Flash...');
                
//                 const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         contents: [{
//                             parts: [{
//                                 text: prompt
//                             }]
//                         }]
//                     })
//                 });

//                 console.log('Response status:', response.status);
                
//                 if (!response.ok) {
//                     const errorText = await response.text();
//                     console.log('API error response:', response.status, errorText);
//                     throw new Error(`API call failed with status: ${response.status}`);
//                 }

//                 const data = await response.json();
//                 console.log('API response:', data);

//                 if (data.candidates && data.candidates[0] && data.candidates[0].content) {
//                     const text = data.candidates[0].content.parts[0].text;
//                     console.log('🎯 AI response received, length:', text.length);
                    
//                     const questions = this.parseQuestions(text, questionType);
//                     if (questions && questions.length > 0) {
//                         console.log(`✅ Successfully generated ${questions.length} AI questions!`);
//                         return questions;
//                     } else {
//                         console.log('⚠️ Parsing failed, no questions returned');
//                     }
//                 } else {
//                     console.log('⚠️ Invalid API response structure:', data);
//                 }

//                 throw new Error('No valid questions generated from API response');
                
//             } catch (apiError) {
//                 console.log('⚠️ AI generation failed:', apiError.message);
//                 throw apiError;
//             }
            
//         } catch (error) {
//             console.error('Error generating questions:', error);
//             console.log('📝 Using sample questions as fallback');
//             return this.generateFallbackQuestions(questionType, questionCount);
//         }
//         */
//     },

//     buildSimplePrompt(paragraph, questionCount, questionType) {
//         const typeInstructions = {
//             'MCQ': 'multiple choice questions with 4 options each',
//             'CHECKBOX': 'multiple choice questions with 4 options each (multiple answers possible)',
//             'TRUE_FALSE': 'true/false questions',
//             'FILL_BLANK': 'fill in the blank questions',
//             'SHORT_ANSWER': 'short answer questions'
//         };

//         return `Create ${questionCount} ${typeInstructions[questionType] || 'questions'} based on this text:

// "${paragraph}"

// Respond ONLY with valid JSON in this exact format:
// {
//   "questions": [
//     {
//       "question": "Your question here?",
//       "choices": ["Option A", "Option B", "Option C", "Option D"],
//       "correctAnswer": "Option A"
//     }
//   ]
// }

// ${questionType === 'TRUE_FALSE' ? 'For true/false questions, use only ["True", "False"] as choices.' : ''}
// ${questionType === 'FILL_BLANK' || questionType === 'SHORT_ANSWER' ? 'For fill-in-blank and short answer questions, use empty array [] for choices and put the correct answer in correctAnswer.' : ''}

// Generate exactly ${questionCount} questions. Make sure your response is valid JSON that can be parsed.`;
//     },

//     buildPrompt(paragraph, questionCount, questionType) {
//         const typeInstructions = {
//             'MCQ': 'multiple choice questions with 4 options each',
//             'CHECKBOX': 'multiple choice questions with 4 options each (multiple answers possible)',
//             'TRUE_FALSE': 'true/false questions',
//             'FILL_BLANK': 'fill in the blank questions',
//             'SHORT_ANSWER': 'short answer questions'
//         };

//         return `Create ${questionCount} ${typeInstructions[questionType] || 'questions'} based on this text:

// "${paragraph}"

// For each question, respond in this exact JSON format:
// {
//   "questions": [
//     {
//       "question": "Your question here?",
//       "choices": ["Option A", "Option B", "Option C", "Option D"],
//       "correctAnswer": "Option A"
//     }
//   ]
// }

// ${questionType === 'TRUE_FALSE' ? 'Use only ["True", "False"] as choices.' : ''}
// ${questionType === 'FILL_BLANK' || questionType === 'SHORT_ANSWER' ? 'Use empty array [] for choices and put the answer in correctAnswer.' : ''}

// Generate exactly ${questionCount} questions. Make sure your response is valid JSON.`;
//     },

//     parseQuestions(responseText, questionType) {
//         try {
//             console.log('Parsing AI response:', responseText.substring(0, 200) + '...');
            
//             // Try to extract JSON from the response - look for the first complete JSON object
//             let jsonMatch = responseText.match(/\{[\s\S]*?\}/);
            
//             // If that doesn't work, try to find JSON between ```json blocks
//             if (!jsonMatch) {
//                 jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
//                 if (jsonMatch) {
//                     jsonMatch[0] = jsonMatch[1];
//                 }
//             }
            
//             // If still no JSON, try the whole response
//             if (!jsonMatch) {
//                 jsonMatch = [responseText.trim()];
//             }

//             const parsedResponse = JSON.parse(jsonMatch[0]);
            
//             if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
//                 throw new Error('Invalid response format - no questions array found');
//             }

//             console.log(`✅ Successfully parsed ${parsedResponse.questions.length} questions from AI`);

//             return parsedResponse.questions.map((q, index) => ({
//                 id: Date.now() + index,
//                 question: q.question,
//                 type: questionType,
//                 choices: q.choices || [],
//                 correctAnswer: q.correctAnswer,
//                 accepted: false
//             }));
//         } catch (error) {
//             console.error('❌ Error parsing AI response:', error);
//             console.log('Raw response was:', responseText);
//             console.log('📝 Using fallback questions instead');
//             return this.generateFallbackQuestions(questionType, 3);
//         }
//     },

//     generateFallbackQuestions(questionType, count) {
//         console.log(`📝 Generating ${count} sample ${questionType} questions`);
        
//         const questionTemplates = {
//             'MCQ': [
//                 { q: "What is the capital of France?", choices: ["London", "Berlin", "Paris", "Madrid"], correct: "Paris" },
//                 { q: "Which planet is closest to the Sun?", choices: ["Venus", "Mercury", "Earth", "Mars"], correct: "Mercury" },
//                 { q: "What is 2 + 2?", choices: ["3", "4", "5", "6"], correct: "4" },
//                 { q: "Who wrote Romeo and Juliet?", choices: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correct: "William Shakespeare" },
//                 { q: "What is the largest mammal?", choices: ["Elephant", "Blue whale", "Giraffe", "Hippopotamus"], correct: "Blue whale" },
//                 { q: "Which gas do plants absorb from the atmosphere?", choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: "Carbon dioxide" },
//                 { q: "What is the smallest unit of matter?", choices: ["Molecule", "Atom", "Cell", "Electron"], correct: "Atom" },
//                 { q: "In which year did World War II end?", choices: ["1944", "1945", "1946", "1947"], correct: "1945" },
//                 { q: "What is the chemical symbol for water?", choices: ["H2O", "CO2", "NaCl", "O2"], correct: "H2O" },
//                 { q: "Which continent is the largest?", choices: ["Africa", "North America", "Asia", "Europe"], correct: "Asia" }
//             ],
//             'TRUE_FALSE': [
//                 { q: "The Earth is flat.", choices: ["True", "False"], correct: "False" },
//                 { q: "Water boils at 100°C at sea level.", choices: ["True", "False"], correct: "True" },
//                 { q: "There are 24 hours in a day.", choices: ["True", "False"], correct: "True" },
//                 { q: "The sun revolves around the Earth.", choices: ["True", "False"], correct: "False" },
//                 { q: "Sharks are mammals.", choices: ["True", "False"], correct: "False" },
//                 { q: "Gold is a chemical element.", choices: ["True", "False"], correct: "True" },
//                 { q: "Lightning never strikes the same place twice.", choices: ["True", "False"], correct: "False" },
//                 { q: "The Great Wall of China is visible from space.", choices: ["True", "False"], correct: "False" },
//                 { q: "Humans have 5 senses.", choices: ["True", "False"], correct: "True" },
//                 { q: "Antarctica is a desert.", choices: ["True", "False"], correct: "True" }
//             ],
//             'SHORT_ANSWER': [
//                 { q: "What is the capital of Japan?", correct: "Tokyo" },
//                 { q: "How many sides does a triangle have?", correct: "3" },
//                 { q: "What color do you get when you mix red and blue?", correct: "Purple" },
//                 { q: "What is the largest ocean on Earth?", correct: "Pacific Ocean" },
//                 { q: "Who invented the telephone?", correct: "Alexander Graham Bell" },
//                 { q: "What is the hardest natural substance?", correct: "Diamond" },
//                 { q: "In which country is the Great Pyramid located?", correct: "Egypt" },
//                 { q: "What is the currency of the United Kingdom?", correct: "Pound Sterling" },
//                 { q: "How many minutes are in an hour?", correct: "60" },
//                 { q: "What is the smallest country in the world?", correct: "Vatican City" }
//             ],
//             'FILL_BLANK': [
//                 { q: "The _____ is the center of our solar system.", correct: "Sun" },
//                 { q: "Water freezes at _____ degrees Celsius.", correct: "0" },
//                 { q: "The capital of the United States is _____.", correct: "Washington D.C." },
//                 { q: "A year has _____ months.", correct: "12" },
//                 { q: "The process by which plants make food is called _____.", correct: "photosynthesis" },
//                 { q: "The largest continent is _____.", correct: "Asia" },
//                 { q: "_____ is known as the Red Planet.", correct: "Mars" },
//                 { q: "The human body has _____ bones.", correct: "206" },
//                 { q: "The fastest land animal is the _____.", correct: "cheetah" },
//                 { q: "_____ is the study of living organisms.", correct: "Biology" }
//             ]
//         };

//         const templates = questionTemplates[questionType] || questionTemplates['MCQ'];
//         const questions = [];

//         for (let i = 0; i < count; i++) {
//             // Use modulo to cycle through templates if we need more questions than templates
//             const template = templates[i % templates.length];
            
//             const question = {
//                 id: Date.now() + i,
//                 question: template.q,
//                 type: questionType,
//                 accepted: false
//             };

//             if (questionType === 'MCQ' || questionType === 'CHECKBOX') {
//                 question.choices = template.choices;
//                 question.correctAnswer = template.correct;
//             } else if (questionType === 'TRUE_FALSE') {
//                 question.choices = template.choices;
//                 question.correctAnswer = template.correct;
//             } else {
//                 question.choices = [];
//                 question.correctAnswer = template.correct;
//             }

//             questions.push(question);
//         }

//         console.log(`✅ Generated ${questions.length} sample questions`);
//         return questions;
//     }
// };