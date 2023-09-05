# 

## Design Requirement Specification Document

DIBRIS – Università di Genova. Scuola Politecnica, Corso di Ingegneria del Software 80154


<div align='right'> <b> Authors </b> <br> Andrea Caliendo <br> Martina Maione  </div>

### REVISION HISTORY

Version | Data | Author(s)| Notes
---------|------|--------|------
1 | 17/05/2023 | Andrea Caliendo <br> Martina Maione | First Version of the document
2 | 05/06/2023 | Andrea Caliendo <br> Martina Maione | Update of the document
3 | 16/06/2023 | Andrea Caliendo <br> Martina Maione | Entity-relationship and class diagram 
4 | 01/07/2023 | Andrea Caliendo <br> Martina Maione | Add Dynamic diagram  
5 | 02/09/2023 | Andrea Caliendo <br> Martina Maione | Updating 

## Table of Content

1. [Introduction](#intro)
    1. [Purpose and Scope](#purpose)  
    2. [Definitions](#def)
    3. [Document Overview](#overview)
    4. [Bibliography](#biblio)
2. [Project Description](#description)
    1. [Project Introduction](#project-intro)
    2. [Technologies used](#tech)
    3. [Assumptions and Constraints](#constraints)
3. [System Overview](#system-overview)
    1. [System Architecture](#architecture)
    2. [System Interfaces](#interfaces)
    3. [System Data](#data)
4. [Web Application](#sys-module-1)
    1. [Structural Diagrams](#sd)
5. [Mobile Application](#sys-module-2)
    1. [Structural Diagrams](#sd)

##  <a name="intro"></a>  1 Introduction
<details>
    <summary> The design specification document reflects the design and provides directions to the builders and coders of the product.</summary> 
    Through this document, designers communicate the design for the product to which the builders or coders must comply. The design specification should state how the design will meet the requirements.
</details>
    
### <a name="purpose"></a> 1.1 Purpose and Scope
This Design Requirement Specification (DRS) is specific to City Logistics ICT Platform. Its main functions are listed as below:
- Management of parking slots used by ccouriers
- Monitoring of expected parking times in a given area

### <a name="def"></a> 1.2 Definitions
Here are listed some definitions used during the project development
  
| Acronym  | Definition |
| ------------- | ------------- |
| WA  | Web Application  |
| MA | Mobile Application  |
| PS | Parking Slot |

### <a name="overview"></a> 1.3 Document Overview
Explain how is organized the document
    <p>Project Description: describes what the project should do</p>
    <p>System Overview: describes the main architecture of the system</p>
    <p>System Module 1: describes what do we need in order to implement the module 1 and what the module 1 does</p>

### <a name="biblio"></a> 1.4 Bibliography
<details> 
    <summary> This section aims at listing the references for this project
    </summary>
</details>

## <a name="description"></a> 2 Project Description

### <a name="project-intro"></a> 2.1 Project Introduction 
Describe at an high level what is the goal of the project and a possible solution

The project of City Logistics ICT Platform is divided into 2 applications:
- one web application where the client can select a desired area. In this area he can decide where he wants to park (for hid seliveries). Once this is done, he will be able to save on a map this specific point by clicking one time and see all the parking slots already saved. The client can also delete a parking slot, by clicking twice on the same point. Furthermore, the client will be able to see all the statistics regarding the parking slots already used, on another page. 
- one mobile application that works only with the authorization of the client on his geolocalization. This application will verify that the courier has entered in a specific area (parking slot) in one specic time slot. This application should also track when the courier will exit this area and notify him if he is exceeding the available time for that PS. The exiting time from that area will be saved in a database in the system. 


### <a name="tech"></a> 2.2 Technologies used
The technologies that the software will use are:
* an external database for the acquisition of the saved car parking in order to print the statistics on the web application
* an external database for the acquisition of the car parking already used by the user
* an external database which contains the timetables of the parking slots in order to understand in which time period which parking slots are available for the user

### <a name="constraints"></a> 2.3 Assumption and Constraint 

Assumptions:
 * The geographical map of the city is given
 * The availability of parking slots is already known
 *  The distance from which the courier is considered to leave the parking slot is given and is always the same
 *  The courier already knows which and where are the parking slots on the map
 *  The statistics to be loaded on the web application are given from an external source 
 

Constraints:
 * The MA must need the geolocalization of the courier in order to work
 
## <a name="system-overview"></a>  3 System Overview
In this section is shown the Use Case Model of the system
<br>
Web application:
<br>
![image](https://github.com/mnarizzano/se23-p07/blob/main/docs/drs/imgs/User%20case%20model%201.jpg) 
<br>
Mobile application:
<br>
![image](https://github.com/mnarizzano/se23-p07/blob/main/docs/drs/imgs/Use%20case%20model%202.jpg) 



### <a name="architecture"></a>  3.1 System Architecture
<details> 
    <summary> Description of the overall architecture. </summary>
    <p>Graphical representation of the system architecture.  May be composed by multiple diagrams depending on the differences in the environment
specifications    </p>
</details>

![diagram](https://github.com/mnarizzano/se23-p07/blob/main/docs/drs/imgs/diagram.jpeg)

### <a name="interfaces"></a>  3.2 System Interfaces
As for the **web application**, the interface will be graphical and will be done as follows:

Administrator mode: 
there will be access to 2 pages:
* Saved parking slots and map
* Statistics

By selecting the map
* with one right-click, the manager can save a parking slot confirm its intent with a pop-up window
* with a double click on the same point, a pop-up window will come out asking the manager to confirm the cancellation
* with two icons representing magnifying glasses (+, -), the user will be able to zoom in and out of the map
* with a drang and drop, the manager is able to move a parking slot on the map
* with an icon, the manager is able to rotate the rectangle of the parking slot
<br>

User mode:
there will be access to 2 pages:
* Personal data
* Saved parking slots and map

By selecting the map

* the user is able to reserve a parking slot, with a right-click on the rectangle
* the user is able to see the state of the parking slot, with the mouse over the parking slot
<br>

Visualizer mode:
there will be access to 1 page: saved parkign slots and map

By selecting the map, the visualizer is able to see all the saved parking slots on the map


![diagram](https://github.com/mnarizzano/se23-p07/blob/main/docs/drs/imgs/webinterface.jpg)
<br>
Regarding the **mobile application**, 
when the user opens the mobile application, a pop-up window will automatically open asking for permission of geolocation. The user can confirm or deny the authorization by clicking on Yes or No.
If the user denies the permission, a warning message will come out that the app cannot track him.
Furthermore, within the application itself there will be a "report" button to report an anomaly in a parking lot.
By clicking on this button, a window will come out in which it will be necessary to indicate:
- the ID of the car park referred to
- The type of problem, through a single-option list, in which the "other" option will also be present, where the user can write the type of problem in a write-box
- the "submit" button to send the report

![diagram](https://github.com/mnarizzano/se23-p07/blob/main/docs/drs/imgs/mobileinterface.png)

### <a name="data"></a>  3.3 System Data

![diagram](https://github.com/mnarizzano/se23-p07/blob/main/docs/drs/imgs/entity%20relationship.jpg)
<br>


## <a name="sys-module-1"></a>  4 Web Application

### <a name="sd"></a>  4.1 Structural Diagrams

#### <a name="cd"></a>  4.1.1 Class diagram
A class diagram provides a visual representation of the classes, relationships, and interactions within a system

![diagram](https://github.com/mnarizzano/se23-p07/blob/main/docs/drs/imgs/class%20diagram.jpg)
<br>

#### <a name="cd"></a>  4.2 Dynamic diagram

![diagram](https://github.com/mnarizzano/se23-p07/blob/main/docs/drs/imgs/Dynamic%20diagram.png)
<br>

## <a name="sys-module-1"></a>  5 Mobile Application


### <a name="sd"></a>  5.1 Structural Diagrams

#### <a name="cd"></a>  5.1.1 Class diagram
A class diagram provides a visual representation of the classes, relationships, and interactions within a system
    
![diagram](https://github.com/mnarizzano/se23-p07/blob/main/docs/drs/imgs/class%20diagram%20mobile.jpg)
<br>








