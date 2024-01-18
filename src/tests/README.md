# Table: Features-Test cases for Web-App
## Test execution
- The tests relative to the web application are inside each component in a spec.ts file (path: `se23-p07/src/Web_app/src/app/component_name`).  
  In order to execute the tests, use the command from command line: ng test
- The tests relative to the mobile application are inside `se23-p07/src/Mobile_app/app/src/androidTest/java/com/example/mobile_app_2` and inside `se23-p07/src/Mobile_app/app/src/test/java/com/example/mobile_app_2` directories.  
  In order to execute the tests, run in test-mode into AndroidStudio using an appropriate device. 

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
| map | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | Initialize the map    | Test to check if the map is well initialized     | Passed |  |
|  | Load data from CSV file    | Test to check the correct data loading from a CSV file     | Passed |  |
|  | Parse a CSV file    | Test to check the correct file parsing     | Passed |  |
|  | Handle right click on rectangle  | Test to check if correctly handles the right click on rectangles    | Passed |  |
|  | Make a PS inacessible    | Change state to inaccessible by clicking on a button  | Passed |  |
|  | Show inaccess popup window    | Show the window to make a PS inaccessible     | Passed |  |
|  | Parse a CSV file    | Test to check the correct file parsing     | Passed |  |
|  | Update state to inaccessible    | Update state to inaccessible into the database     | Passed |  |
|  | Handle rectangle right-click    | Handle the right-click on a PS    | Passed |  |
|  | Load PS   | Load parking slots on the database    | Passed |  |
|  | Handle adding a PS    | Add a rectangle on the map     | Passed |  |
|  | Show add box confirmation window   | Show a window to confirm adding a box     | Passed |  |
|  | Move a PS   | Move a parking slot on the map     | Passed|  |
|  | Delete a PS   | Delete a parking slot     | Passed |  
|  | Show delete box confirmation window   | Show a window to confirm deleting a box     | Passed |  |
|  | Save PS   | Save parking slots in the DB  | Passed |  |
|  | Manages the save-button click   | Save by clicking on save-button     | Passed |  |
|  | Search address  | Search an address using the search-bar     | Passed |  |
|  | Get address  | Get the address from coordinates   | Passed |  |
|  | Show saved parking slots on the map   | Loads and shows PS on the map     | Passed |  |
|  | Add a marker  | Add a marker for each PS     | Passed |  |
|  | Change color of PS  | Change color depending on the state     | Passed |  |
|  | Show book popup  | Show a popup for booking a PS     | Passed |  |
|  | Open a modal window for booking  | Open a modal window that show the timeslots of a selected PS   | Passed |  |
|  | Show property popup  | Show a popup with PS properties    | Passed |  |
|  | Delete all PS  | Delete all parking slots clicking on a button   | Passed |  |
|  | Load PS using a CSV file  | Load PS on the map and on the database by selecting a CSV file  | Passed |  |
| menù | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | Set isAdmin   | Should call AuthService.isAdmin and set isAdmin to true     | Passed |  |
|  | Set isAdmin   | Should call AuthService.isAdmin and set isAdmin to false      | Passed |  |
|  | Sign out   | Should call SignOut on redirectToPage with page "sign-in"     | Passed |  |
|  | Redirect to another page   | Should navigate on redirectToPage with page other than "sign-in"      | Passed |  |
| personal-data | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | Update the personal information   | Test to check if it updates the personal information     | Passed |  |
|  | Take the user data as input   | Should fetch user data on initialization     | Passed |  |
|  | Update the address   | Should update the address     | Passed |  |
|  | Update the phone number   | Should update the phone number     | Passed |  |
| save-confirmation | Create the component   | Test to check the correct creation of the component     | Passed |  |
|  | Confirmation button   | confirmSave should emit true and hide the modal             | Passed |  |
|  | Cancel button  | confirmSave should emit false and hide the modal              | Passed |  |
| sign-in | Create the component   | Test to check the correct creation of the component     | Passed | User log in  |
|  | Click on "sign in"  | signInOnEnter should call SignIn from the authService          | Passed | User log in  |
| sign-up | Create the component   | Test to check the correct creation of the component     | Passed | User registration |
|  | User registration  | onSignUp function should call SignUp with correct values     | Passed | when all fields are filled |
|  | User registration    | onSignUp should log a message     | Passed | when not all fields are filled |
|  | Choice of the role   | toggleAdmin function should toggle the value of isAdmin     | Passed | to change the role of the user |
| statistics | Create the component   | Test to check the correct creation of the component     | Passed | Data statistics visualization |
|  | Initialization of the component properties   | Test to check if it initializes the properties correctly     | Passed |  |
|  | Calculate the average parking duration   | Test to check if the calculateAverageParkingDuration function works correctly     | Passed |  |
|  | Get the parking lot addresses from database  | Test to check if the getParkingLotAddresses function works correctly     |  Passed |  |
|  | Get one single parking lot address   | Test to check if the getParkingLotAddress function works correctly     | Passed |  |
|  | Calculate the most used days   | Test to check if the calculateMostUsedDays function works correctly     | Passed|  |
|  | Plot the most used days   | Test to check if the createBarChart function works correctly     | Passed |  |
|  | Calculate the most used parking slots   | Test to check if the calculateMostUsedParkingLots function works correctly     | Passed |  |
|  | Plot the most used parking slots  | Test to check if the createParkingLotBarChart function works correctly     | Passed |  |
| verify-email | Create the component   | Test to check the correct creation of the component     | Passed |  |
