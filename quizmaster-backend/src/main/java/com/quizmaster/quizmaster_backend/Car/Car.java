package com.quizmaster.quizmaster_backend.Car;

public class Car {
    private String brand;
    private String name;
    private double plateNum;
    private String engine;

    public Car(String brand, String name, double plateNum, String engine) {
        this.brand = brand;
        this.name = name;
        this.plateNum = plateNum;
        this.engine = engine;
    }

    public String getBrand() {
        return brand;
    }

    public String getName() {
        return name;
    }

    public double getPlateNum() {
        return plateNum;
    }

    public String getEngine() {
        return engine;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public void setPlateNum(double plateNum) {
        this.plateNum = plateNum;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEngine(String engine) {
        this.engine = engine;
    }

    @Override
    public String toString() {
        return "Car [brand=" + brand + ", name=" + name + ", plateNum=" + plateNum + ", engine=" + engine + "]";
    }

    
}
