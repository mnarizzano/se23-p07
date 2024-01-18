package com.example.mobile_app_2;

public class User {
    private String displayName;
    private String phoneNumber;
    private String address;
    private String email;
    private String photoURL;
    private String uid;

    public User() {

    }

    public User(String displayName, String phoneNumber, String address, String email, String photoURL, String uid) {
        this.displayName = displayName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.email = email;
        this.photoURL = photoURL;
        this.uid = uid;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public String getEmail() {
        return email;
    }

    public String getPhotoURL() {
        return photoURL;
    }

    public String getUid() {
        return uid;
    }
}
