
### User Requirements Specification Document
##### DIBRIS – Università di Genova. Scuola Politecnica, Software Engineering Course 80154


**VERSION : 4.0**

**Authors**  
Andrea Caliendo  
Martina Maione

**REVISION HISTORY**

| Version    | Date        | Authors      | Notes        |
| ----------- | ----------- | ----------- | ----------- |
| 1.0 | 03/04/2023 |Andrea Caliendo <br> Martina Maione | First description of the project |
| 2.0 | 19/04/2023 |Andrea Caliendo <br> Martina Maione | Updating of requirements |
| 3.0 | 05/05/2023 |Andrea Caliendo <br>Martina Maione | Correction of requirements |
| 4.0 | 08/05/2023 |Andrea Caliendo <br> Martina Maione | Last version of requirements |
| 5.0 | 02/09/2023 |Andrea Caliendo <br> Martina Maione | Updating of requirements (meeting with the company) |


# Table of Contents

1. [Introduction](#p1)
	1. [Document Scope](#sp1.1)
	2. [Definitios and Acronym](#sp1.2) 
	3. [References](#sp1.3)
2. [System Description](#p2)
	1. [Context and Motivation](#sp2.1)
	2. [Project Objectives](#sp2.2)
3. [Requirement](#p3)
 	1. [Stakeholders](#sp3.1)
 	2. [Functional Requirements](#sp3.2)
 	3. [Non-Functional Requirements](#sp3.3)
  
  

<a name="p1"></a>

## 1. Introduction
<a name="sp1.1"></a>
This documents is the User Requirement Document taken from the first interview with the Group-FOS company. The document describes the functionalities of:
- a web application that will have to manage the saving of parking spaces within an area of an urban map. In addition, it must allow you to delete previously entered parking spaces and view the history of entered parking spaces.
- a mobile application for tracking the courier which, based on the position, will have to save the time of entry and exit of the courier from a special parking lot.

### 1.1 Document Scope
The purpose of this document is to clearly and precisely express the customer's needs and requests and to keep track of changes and updates.

<a name="sp1.2"></a>

### 1.2 Definitios and Acronym


| Acronym				| Definition | 
| ------------------------------------- | ----------- | 
| Group-FOS                                  | Is the client |
| OpenStreetMap                          | [Map-visualizing software](https://www.openstreetmap.org/#map=6/42.088/12.564)|
|Angular                              | [Grafic tool](https://angular.io)|


<a name="sp1.3"></a>

### 1.3 References 

<a name="p2"></a>

## 2. System Description
<a name="sp2.15"></a>

### 2.1 Context and Motivation

<a name="sp2.2"></a>

The client needs a system for the optimization of delivery logistics, in order to improve the delivery time and have a less fuel consumption. This system could be useful for the Public Administration or an external client to have some statistical analysis of the urban logistics. 
The entire system includes optimization of delivery routes (with notification of unforeseen events), parking reservation (with analysis of the permanence) and behaviour scoring of the couriers. 

### 2.2 Project Obectives 

<a name="p3"></a>

The project consists in the creation and implementation of a web application useful for the couriers to have a map of the parking slots of a certain city and a mobile application useful for a third part to track the position of the couriers and analyze if they use the parking slots in the right way. These applications are a portion of a wider system that has to regulate and optimize the urban mobility by improving the delivery routes and making the couriers park without having or creating problems in the car mobility.
## 3. Requirements

| Priority | Meaning | 
| --------------- | ----------- | 
| M | **Mandatory:**   |
| D | **Desiderable:** |
| O | **Optional:**    |
| E | **future Enhancement:** |

<a name="sp3.1"></a>
### 3.1 Stakeholders

<a name="sp3.2"></a>

- Internal stakeholders: FOS group manager, FOS group company
- External stakeholders: couriers and the future owner (for example Public Administration or a private company)

### 3.2 Functional Requirements 
The web application should be built in this way:
| ID | Description | Priority |
| --------------- | ----------- | ---------- | 
| 1.0 |  There should be 3 roles with different permissions: administrator, user and visualizer |M|
| 2.0 |  The administrator should be able to save the parking slots of a city, by a right-click on the map, and to add the relative properties |M|
| 3.0 |  The administrator should be able to delete the parking slots from the map, by a double click on the rectangle |M|
| 4.0 |  The visualizer should be able to access the list of the saved parking slots |M|
| 5.0 |  The visualizer should be able to see the properties of each parking slot, simply clicking on the rectangle |M|
| 6.0 |  The user should be able to reserve a parking slot, if this is not taken by another user, by a right-click on the rectangle |M|
| 7.0 |  Each parking slot should have associated the state (free, unaccessible, busy) |M|
| 8.0 |  The color of the parking slot depends on its state (green: reserved by the user, yellow: free, red: occupied by someone else) |M|
| 9.0 |  The administrator should have access to a statistic analysis of the average hours of stay, the days of the week when a single car park is, on average, more used and which car parks are more used than the others. |O|
| 10.0 |  The rectangle should be rotatable |M|
| 11.0 |  The administrator should be able to move the rectangle on the map using drang and drop |M|
| 12.0 | The visualizer should be able to see the zoomable map with all the parking slots |M|

For the mobile application:
| ID | Description | Priority |
| --------------- | ----------- | ---------- | 
| 1.0 |  the user should be able to start the mobile application |M|
| 2.0 |  the third-part client should be able to see the permanence time of a courier inside a parking slot |M|
| 3.0 |  the application should run in background |M|
| 4.0 |  the system should notify the courier that his available permanence time is expiring |O|
| 5.0 |  the system user should be able to notify an anomaly in the parking slot (inaccessibility or unavailability) |D|
| 6.0 |  the user should be able to see a dashboard with his score and infractions |D|
| 7.0 |  the system should understand if the user entered a parking area, the permanence interval in that area and the exiting time  |M|
| 8.0 | notify an anomaly by simply clicking on a specific button  |O|
<a name="sp3.3"></a>

### 3.2 Non-Functional Requirements 

For the mobile application
| ID | Description | Priority |
| --------------- | ----------- | ---------- | 
| 1.0 | the user has to give the permissions for his position tracking |M|
| 2.0 | the mobile application should be implemented for android operating system (from O.S. 9 to the last) |M|


