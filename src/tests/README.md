# Table: Features-Test cases

## Description
The following table represents a matrix that links different features of the application to their respective test cases. 
Each row in the table represents a specific feature or application requirement, while the columns identify the associated test cases for that feature. 
The status indicates whether the test is in progress, failed or completed, and the notes allow for additional details or any test-related observations to be added. 
This table serves as a powerful tool for tracking progress in the testing process and ensuring that all features are thoroughly tested.

| Component | Funzionalità/Requisito | Test Case | Stato  | Note                        |
| ----------------------| ---------------------- | --------- | ------ | --------------------------- |
| add-box confirmation | Create the component  | Test to check the correct creation of the component | Passed |  |
|  | Click on the add button| Test to check if it emits the event "onAddBox" and hides the modal window | Passed |  |
| booking | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | Click on the booking button| Test to check if it emits the event "onConfermaClick" and hides the modal window | Passed |  |
|  | Update the selected timeslots| Test to check if it updates the selected timeslots correctly | Passed |  |
| delete-all confirmation | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | Click onCancel button   | Test to check if the onCancel function hides the modal window     | Passed |  |
|  | Click onConfirm button   | Test to check if the onConfirm function hides the modal window and calls deleteAllParcheggi     | Passed | correct behavior |
|  | Click onConfirm button   | Test to check if the onConfirm function hides the modal window and logs an error on failure    | Passed | error management |  
| delete confirmation | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | Click on the closing button  | Test to check if it emits the result and hides the modal window     | Passed |  |
| forgot-password | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | AuthService injection   | Test to check if it correctly inject the service     | Passed |  |
|  | Call of ngOnInit   | Test to check if it calls ngOnInit without errors     | Passed |  |
| home | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | Set isAdmin  | Should set isAdmin to true when user is an admin     | Passed | when the user is an administrator |
|  | Set isAdmin  | Should set isAdmin to false when user is not an admin      | Passed | when the user isn't an administrator |
| map-user | Create the component   | Test to check the correct creation of the component     | Passed |  |
| map | Create the component   | Test to check the correct creation of the component     | In progress |  |
| menù | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | Set isAdmin   | Should call AuthService.isAdmin and set isAdmin to true     | Passed |  |
|  | Set isAdmin   | Should call AuthService.isAdmin and set isAdmin to false      | Passed |  |
|  | Sign out   | Should call SignOut on redirectToPage with page "sign-in"     | Passed |  |
|  | Redirect to another page   | Should navigate on redirectToPage with page other than "sign-in"      | Passed |  |
| personal-data | Create the component   | Test to check the correct creation of the component     | In progress |  |
| save-confirmation | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | Confirmation button   | confirmSave should emit true and hide the modal             | Passed |  |
|  | Cancel button  | confirmSave should emit false and hide the modal              | Passed |  |
| sign-in | Create the component   | Test to check the correct creation of the component     | Passed | User log in  |
|  | Click on "sign in"  | signInOnEnter should call SignIn from the authService          | Passed | User log in  |
| sign-up | Create the component   | Test to check the correct creation of the component     | Passed | User registration |
|  | User registration  | onSignUp function should call SignUp with correct values     | Passed | when all fields are filled |
|  | User registration    | onSignUp should log a message     | Passed | when not all fields are filled |
|  | Choice of the role   | toggleAdmin function should toggle the value of isAdmin     | Passed | to change the role of the user |
| statistics | Create the component   | Test to check the correct creation of the component     | In progress | Data statistics visualization |
| verify-email | Create the component   | Test to check the correct creation of the component     | Passed |  |
