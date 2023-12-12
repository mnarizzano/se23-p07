# Table: Features-Test cases for Mobile App

## Description
The following table represents a matrix that links different features of the application to their respective test cases. 
Each row in the table represents a specific feature or application requirement, while the columns identify the associated test cases for that feature. 
The status indicates whether the test is in progress, failed or completed, and the notes allow for additional details or any test-related observations to be added. 
This table serves as a powerful tool for tracking progress in the testing process and ensuring that all features are thoroughly tested.

| Component | Funzionalità/Requisito | Test Case | Stato  | Note                        |
| ----------------------| ---------------------- | --------- | ------ | --------------------------- |
| LoginActivity | Login with valid credentials  | Test when user logs in with valid credentials | Passed |  |
|  | Login with invalid credentials  | Test when user logs in with invalid credentials | Passed |  |
|  | Show HomeActivity after successful login  | When user is already logged in | Passed |  |
|  | Login without credentials  | when the user enters no credentials | Passed |  |
| SignupActivity | Sign up with valid data  | When a user registers with all fields filled | Passed |  |
|  | Signup with some empty fields  | Test when user registers with some empty fields | Passed |  |
| HomeActivity | Geolocatlization permissions  | Test if the permissions of geolocalization is given after consensus | Passed |  |
|  DatabaseTestParking| Creation of entry/exit polygon  | Test it after the booking of a PS | Passed |  |
