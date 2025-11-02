import { LuFilter } from 'react-icons/lu';
import { FiEdit2 } from 'react-icons/fi';
import { AiOutlineSave } from 'react-icons/ai';
import { AiOutlineDelete } from 'react-icons/ai';

export default function QuestionBank() {

    const questions = [
        { id: 1, question: "What is React?", category: "JavaScript", difficulty: "Easy", actions: <><FiEdit2/> <AiOutlineDelete/> <AiOutlineSave/> </>},
        { id: 2, question: "What is useState?", category: "React Hooks", difficulty: "Medium", actions: "Edit | Delete | Save" },
        { id: 3, question: "What is JSX?", category: "JavaScript", difficulty: "Easy", actions: "Edit | Delete | Save" },
        { id: 4, question: "What is useEffect?", category: "React Hooks", difficulty: "Hard", actions: "Edit | Delete | Save" },
    ];

    return (
        <div className="Question-Bank-Content">
            <SelectionGrid/>
            <div>
                <FilterBar/>
                <div className="Question-Bank-Table">
                    <div className="Question-Bank-Header">
                        <div>Question</div>
                        <div>Category</div>
                        <div>Difficulty</div>
                        <div>Actions</div>
                    </div>

                    <div className="Question-Bank-Body">
                        {questions.map((q) => (
                        <div key={q.id} className="Question-Bank-Row">
                            <div>{q.question}</div>
                            <div>{q.category}</div>
                            <div>{q.difficulty}</div>
                            <div className="action-icons">{q.actions}</div>
                        </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}


function SelectionGrid() {
    return (
        <div className="Selection-Question">
            <div className="box-select">
                <div className="box-top">133</div>
                <div className="box-bottom">All Questions</div>
            </div>
            <div className="box-select">
                <div className="box-top">12</div>
                <div className="box-bottom">Published</div>
            </div>
            <div className="box-select">
                <div className="box-top">5</div>
                <div className="box-bottom">Drafts</div>
            </div>
            <div className="box-select">
                <div className="box-top">14</div>
                <div className="box-bottom">Categories</div>
            </div>
            <div className="box-select">
                <div className="box-top">56</div>
                <div className="box-bottom">Easy</div>
            </div>
            <div className="box-select">
                <div className="box-top">32</div>
                <div className="box-bottom">Medium</div>
            </div>
            <div className="box-select">
                <div className="box-top">22</div>
                <div className="box-bottom">Hard</div>
            </div>
        </div>
    );
}

function FilterBar() {
    return (
        <div className="Question-Bank-Filter">
            <div className="filter-left">
                <div><LuFilter size="20px"/></div>
                <div>Filter</div>
                <div className="filter-type">
                    <div>MSQ</div>
                    <div>T/F</div>
                    <div>Short Answer</div>
                    <div>Matching</div>
                </div>
            </div>

            <div  className="question-bank-search">
                <input type="text" placeholder='Search...'></input>
            </div>
        </div>
    );
}