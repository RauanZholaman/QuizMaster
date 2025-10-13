package com.quizmaster.quizmaster_backend.Car;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "api/v1/car")
public class CarController {
    
    @GetMapping
	public List<Car> hello() {
		return List.of(
			new Car(
				"Toyota",
				"GC4",
				2,
				"Tuareq"
			)
		);
	}
}
