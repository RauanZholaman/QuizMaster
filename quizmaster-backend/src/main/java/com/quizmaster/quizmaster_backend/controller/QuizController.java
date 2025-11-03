package com.quizmaster.quizmaster_backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import com.quizmaster.quizmaster_backend.model.Quiz;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private CollectionReference getQuizzesCollection() {
        // Lazily get Firestore each time
        return FirestoreClient.getFirestore().collection("quizzes");
    }

    @PostMapping
    public Map<String, Object> createQuiz(@RequestBody Quiz quiz) throws ExecutionException, InterruptedException {
        if (quiz.getQuestions() == null || quiz.getQuestions().size() < 10) {
            return Map.of("success", false, "message", "At least 10 questions required");
        }

        String id = UUID.randomUUID().toString();
        quiz.setId(id);
        if (quiz.getStatus() == null) quiz.setStatus("draft");

        FirestoreClient.getFirestore().collection("quizzes").document(id).set(quiz).get();

        return Map.of("success", true, "id", id);
    }

    @GetMapping
    public List<Quiz> listQuizzes(@RequestParam(required = false) String status) throws ExecutionException, InterruptedException {
        Query query = (status == null)
                ? FirestoreClient.getFirestore().collection("quizzes")
                : FirestoreClient.getFirestore().collection("quizzes").whereEqualTo("status", status);

        ApiFuture<QuerySnapshot> querySnapshot = query.get();
        List<Quiz> result = new ArrayList<>();
        for (DocumentSnapshot doc : querySnapshot.get().getDocuments()) {
            result.add(doc.toObject(Quiz.class));
        }
        return result;
    }

    @PutMapping("/{id}/publish")
    public Map<String, Object> publishQuiz(@PathVariable String id) throws ExecutionException, InterruptedException {
        DocumentReference docRef = FirestoreClient.getFirestore().collection("quizzes").document(id);
        DocumentSnapshot snapshot = docRef.get().get();

        if (!snapshot.exists()) {
            return Map.of("success", false, "message", "Quiz not found");
        }

        docRef.update("status", "published").get();
        return Map.of("success", true);
    }
}