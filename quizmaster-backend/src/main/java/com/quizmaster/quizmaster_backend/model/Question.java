package com.quizmaster.quizmaster_backend.model;

import java.util.List;

public class Question {
    private String id;
    private String type; // "MCQ", "TrueFalse", "ShortAnswer"
    private String questionText;
    private List<String> options; // for MCQ
    private String correctAnswer; // optional

    // constructors, getters, setters
    public Question() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
}