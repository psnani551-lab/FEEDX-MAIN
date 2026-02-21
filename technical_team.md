# AS A TECHINICAL MEMBER:
This is the FEEDX Community Website.
Features of this website:
* 1.Updates 
* 2.Projects and Initiatives by Feedx team
* 3.Resources : various resources available for exam preperation, online courses , previous question papers.
* 4.student analysis : we will be providing the analysis of student's marks, attendence ,top subjects , weak subjects with just their pin number this is achieved by the api url fetch from sbtet website  
    * atendence api: `/api/attendance?pin=<PIN>` (backend endpoint)
      * upstream: `https://www.sbtet.telangana.gov.in/api/api/PreExamination/getAttendanceReport?Pin=<PIN>`
    * results api: `/api/results?pin=<PIN>` (backend endpoint)
      * upstream: `https://www.sbtet.telangana.gov.in/api/api/Results/GetConsolidatedResults?Pin=<PIN>`
* spotlight : for all the feedx events and moments 


  ---
  ## this website is built with typescript 
  ## student analysis data is fetched via python flask server
  ## the notifications, updates, spotlight and resources are uploaded via admin panel which is not available from direct links in the website you have to contact the technical head to get the admin panel link 
  ## the institute profile is static and fetched via tgpolycet institute profile webpage
  ## AS THE PROJECTS AND COLLEGE LIST ARE MAJOR CHANGES AND DONT REQUIRE CONSTANT CHANGING WE HAVE TO RELY ON TECHNICAL TEAM 
  ## but for the basic constant updates like notifications , updates , resources and other we will take use of admin panel
  

  # Cost and maintainence
  For hosting we are using microsoft azure with a rotation plan 

  the technical head of every year must be applying to the github student pack and claim the $100 worth of credits for microsoft azure and they have to host the website in their azure plan , the process will be said by previous technical head and has to passed on to next technical head

  the reason for choosing this is we reduce costs a lot for vps as we can host our database , website and all in azure and we will be only needed to pay for the domain

  claiming domain from the cloudflare website to ensure security

  we will be having the project in a docker container so that migration is easy

  for more info about the rotation of website contact the technical head 