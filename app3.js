const express = require("express");
const bodyparser = require("body-parser");
const { render } = require("ejs");
const mysql = require("mysql");
const nodemailer = require("nodemailer");
var _ = require('lodash');
const { toInteger, isInteger } = require("lodash");
const path = require("path");
const multer = require("multer");

// const prompt = require("node-popup");
// const popupS = require("popups");
// const pop = require("./pop");
// var prompt = require("prompt");
// var readline = require("readline-sync");


const app = express();

app.set("views",path.join(__dirname,"views"))
app.set("view engine" , "ejs");

app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("public"));



const connection = mysql.createConnection({
    host:"localhost",
    port:3308,
    user:"root",
    password:"",
    database: "bmsar_db1"
});
connection.connect(function(error) {
    if(error) throw error;
    else console.log("Connected to DB successfully")
});


var transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'bmscearena@gmail.com',                                                                                  pass:'arenabmsce'
    }
});




app.get("/" , function(req,res){
    usn = "";
    password = "";
    res.render("login",{title:" Log-In",usnerror:"" , passworderror:"" , usnvalue:"" , passwordvalue:"", loginName:"ADMIN LOGIN" , loginAddress: "adminLogin"});
});



app.get("/Signup" , function(req,res){
    res.render("Signup",{title:" Sign-Up",NameValue:"" , UsnValue:"" , EmailValue:"" , PasswordValue:"" , BranchValue:"" , ContactValue:"" , YearValue:"", Errortext :"" ,  loginName:"ADMIN LOGIN" , loginAddress: "adminLogin"});
});





// 1


//  app.post("/eventsList", function(req,res) {

//     usn = req.body.usn;   
//     password = req.body.password;

//     console.log(usn);
//     console.log(password);

//     if (usn==""&&password=="") {
//         res.render("login",{title:" Log-In", usnerror:"*****this is required*****" , passworderror:"*****This is required*****" , usnvalue:"" , passwordvalue:"",loginAddress:"eventsList",loginName:"ADMIN LOGIN"});
//         //res.redirect("/login",{title:" Log-In", usnerror:"*****this is required*****" , passworderror:"*****This is required*****" , usnvalue:"" , passwordvalue:""});
//     } 
//     else if(usn==""){
//         res.render("login",{title:" Log-In",usnerror:"*****this is required*****", passworderror:"" , usnvalue:"" , passwordvalue:password, loginAddress:"eventsList",loginName:"ADMIN LOGIN"});
//     }
//     else if(password==""){
//         res.render("login",{title:" Log-In",usnerror:"", passworderror:"*****this is required*****" , usnvalue:usn, passwordvalue:"", loginAddress:"eventsList",loginName:"ADMIN LOGIN"});
//     }
//     else{
//     res.render("eventsList", {title:"-events list", loginName:usn , loginAddress:"eventsList"});
//     }

// });





//EVENTS POST ==>after LOG-IN
let Events_array = [] ;
var events_for_reg = [];
var All_Notify = [];
var usn;
var password;
 app.post("/eventsList", function(req,res) {

    

    usn = req.body.usn;   
    password = req.body.password;

    console.log(usn);
    console.log(password);

    if (usn==""&&password=="") {
        res.render("login",{title:" Log-In", usnerror:"*****this is required*****" , passworderror:"*****This is required*****" , usnvalue:"" , passwordvalue:"" , loginAddress:"eventsList",loginName:"ADMIN LOGIN"});
    } 
    else if(usn==""){
        res.render("login",{title:" Log-In",usnerror:"*****this is required*****", passworderror:"" , usnvalue:"" , passwordvalue:password , loginAddress:"eventsList",loginName:"ADMIN LOGIN" });
    }
    else if(password==""){
        res.render("login",{title:" Log-In",usnerror:"", passworderror:"*****this is required*****" , usnvalue:usn, passwordvalue:"" , loginAddress:"eventsList",loginName:"ADMIN LOGIN"});
    }
    else {

            //EVENTS LIST
              connection.query("SELECT * FROM event_date, admin_events WHERE event_date.event_id=admin_events.event_id and (reg_start<curdate() and  reg_due>curdate())",function(error,results,fields){
    
               events_for_reg = JSON.parse(JSON.stringify(results));  //MAIN ARRAY
              });
                  console.log(events_for_reg);  

                  
                // NOTIFAICTIONS  
             connection.query("SELECT * from gen_notifs UNION SELECT dt,info from notifications where event_id in (SELECT event_id FROM user_reg WHERE usn= ? )" ,[usn],function(error,result,field){
                        All_Notify = JSON.parse(JSON.stringify(result));
                });
                 console.log(All_Notify);

        connection.query("select * from user_login where usn= ? and passw = ?",[usn,password],function(error,results,fields){
            if(results.length > 0)
            {    
                res.render("eventsList", {title:"-events list",loginName:usn , loginAddress:"StudentProfile"  , Events_array :events_for_reg , Data_AllNotify : All_Notify});
                
            }
                else
            {
                res.render("login",{title:" Log-In", usnerror:"*****Incorrect Username or Password*****" , passworderror:"" , usnvalue:"" , passwordvalue:"" , loginName:"ADMIN LOGIN" , loginAddress:"adminLogin"});
            }
                res.end();
        });
    }
});







var Sup_events_for_reg = [];
// EVENTS POST ==> SIGN UP
app.post("/eventsList2" , function(req,res){
    var S_Name = req.body.SName;
    var S_Usn   = req.body.SUsn;
    var S_Email  = req.body.SEmail;
    var S_Password  = req.body.SPassword;
    var S_Branch = req.body.SBranch;
    var S_Contact = req.body.SContact;
    var S_Year   = req.body.SYear;

    usn = S_Usn;   //to pass the value
    S_Usn = S_Usn.toUpperCase();

    console.log(S_Name);
    console.log(S_Usn);
    console.log(S_Email);

    console.log(S_Email.substring(S_Email.length-12,S_Email.length));
    console.log(S_Password);
    console.log(S_Branch);
    console.log(S_Contact);
    console.log(S_Year);
    

    var UsnVerify = S_Usn.substring(1,3);
    console.log(UsnVerify);

    var EmailVerify = S_Email.substring(S_Email.length-12,S_Email.length);
    // write your query here.................................
    var otpg=(Math.floor(Math.random() * 9000)+1000); //otp system generated
    //var otpr;   //otp from user
    var fullName = S_Name.split(' '),
    firstName = fullName[0],
    lastName = fullName[fullName.length - 1];
    console.log('otp genreated:'+otpg);
    
    if(S_Name==""||S_Usn==""||S_Email==""||S_Password==""||S_Branch==""||S_Contact==""||S_Year==""){
    res.render("Signup",{title:" Sign-Up",NameValue:S_Name , UsnValue:S_Usn , EmailValue:S_Email , PasswordValue:"" , BranchValue:S_Branch , ContactValue:S_Contact , YearValue:S_Year, Errortext :"Please enter all the Credentials!" ,  loginName:"ADMIN LOGIN" , loginAddress: "adminLogin"});
    } 
    else if(EmailVerify!="@bmsce.ac.in"){
        res.render("Signup",{title:" Sign-Up",NameValue:S_Name , UsnValue:S_Usn , EmailValue:S_Email , PasswordValue:"" , BranchValue:S_Branch , ContactValue:S_Contact , YearValue:S_Year, Errortext :"Please enter the official BMSCE mail id!" ,  loginName:"ADMIN LOGIN" , loginAddress: "adminLogin"});
    }
    else if(UsnVerify!="BM"||S_Usn.length!=10){
        res.render("Signup",{title:" Sign-Up",NameValue:S_Name , UsnValue:S_Usn , EmailValue:S_Email , PasswordValue:"" , BranchValue:S_Branch , ContactValue:S_Contact , YearValue:S_Year, Errortext :"Please enter a valid USN!" ,  loginName:"ADMIN LOGIN" , loginAddress: "adminLogin"});
    }
    else
    {
        // if(otpr==otpg){
        // Email verification


        connection.query("select * from user_login where email=?",[S_Email],function(error2,result2,fields2){

            console.log(result2);
            if(result2.length>0){
                res.render("Signup",{title:" Sign-Up",NameValue:S_Name , UsnValue:S_Usn , EmailValue:S_Email , PasswordValue:"" , BranchValue:S_Branch , ContactValue:S_Contact , YearValue:S_Year, Errortext :"Email id enterd is already registered!" ,  loginName:"ADMIN LOGIN" , loginAddress: "adminLogin"});
            }

        // usn verification
            else{
            connection.query("select * from user_login where usn=?",[S_Usn],function(error1,result1,fields1){
                if(result1.length>0){
                res.render("Signup",{title:" Sign-Up",NameValue:S_Name , UsnValue:S_Usn , EmailValue:S_Email , PasswordValue:"" , BranchValue:S_Branch , ContactValue:S_Contact , YearValue:S_Year, Errortext :"USN entered is already registered!" ,  loginName:"ADMIN LOGIN" , loginAddress: "adminLogin"});
                }

                else{

                    var mailOptions= {
                        from : 'bmscearena@gmail.com',
                        to: S_Email,
                        subject:'Successfull Registration',
                        // text:'Your otp for this session is '+otpg+'. This will be valid for 120 seconds.'
                        text : 'Congratulations! '+firstName+' '+lastName+' Welcome to BMSCE ARENA, you are authorized to access all the events, ALL THE BEST!'
                        };
                        transporter.sendMail(mailOptions,function(error, info){
                        if(error)
                        console.log(error);
                        else
                        console.log('Email sent: '+info.response);
                        });

                    // Data Insertion above email only sent when otp successful
                    connection.query("INSERT INTO user_login values(?,?,?,?,?,?,?,?)",[S_Usn,S_Password,S_Email,firstName,lastName,S_Branch,S_Year,S_Contact],function(error,result,fields){
                    console.log("Fname: "+firstName+" Lastname: "+lastName);
                    console.log(error);
                    console.log('Entered');
                    });

                    // ALL EVENTS
                connection.query("SELECT * FROM event_date, admin_events WHERE event_date.event_id=admin_events.event_id and (reg_start<curdate() and  reg_due>curdate()) order by admin_events.event_id",function(error,results,fields){
                Sup_events_for_reg = JSON.parse(JSON.stringify(results));  //MAIN ARRAY
                console.log(Sup_events_for_reg);
                });

                // ALL NOTIFICATIONS
                //  connection.query("SELECT * from gen_notifs UNION SELECT dt,info from notifications where event_id in (SELECT event_id FROM user_reg WHERE usn= ? )" ,[usn],function(error,result,field){
                //         All_Notify = JSON.parse(JSON.stringify(result));
                // });
                //  console.log(All_Notify);

                 All_Notify = [{ dt: '', info: 'Successfully Registerd!' },
                { dt: '', info: 'Welcome to BMSCE ARENA !' }];


                res.render("eventsList", {title:"-events list",loginName:usn , loginAddress:"StudentProfile"  , Events_array : Sup_events_for_reg , Data_AllNotify : All_Notify });
                // }
            // else
            // {
            // res.render("Signup",{title:" Sign-Up",NameValue:S_Name , UsnValue:S_Usn , EmailValue:S_Email , PasswordValue:"" , BranchValue:S_Branch , ContactValue:S_Contact , YearValue:S_Year, Errortext :"Invalid OTP. Please try again!" ,  loginName:"ADMIN LOGIN" , loginAddress: "adminLogin"});
            // }

            
            }
            });
        }
            });
        }
        });




// GET ==>events (Log-in)
app.get("/eventsList" , function(req,res){
connection.query("SELECT * FROM event_date, admin_events WHERE event_date.event_id=admin_events.event_id and (reg_start<curdate() and  reg_due>curdate()) order by admin_events.event_id",function(error,results,fields){
    
           events_for_reg = JSON.parse(JSON.stringify(results));  //MAIN ARRAY

           // to update the notifications
            connection.query("SELECT * from gen_notifs UNION SELECT dt,info from notifications where event_id in (SELECT event_id FROM user_reg WHERE usn= ? )" ,[usn],function(error,result,field){
                        All_Notify = JSON.parse(JSON.stringify(result));
                });

                res.render("eventsList",{title:"-eventslist", loginName:usn,loginAddress:"StudentProfile" , Events_array :events_for_reg, Data_AllNotify : All_Notify });
    });
     
});


// GET ==> EVENTS (Sign-in)
connection.query("SELECT * FROM event_date, admin_events WHERE event_date.event_id=admin_events.event_id and (reg_start<curdate() and  reg_due>curdate()) order by admin_events.event_id",function(error,results,fields){
  
         Sup_events_for_reg = JSON.parse(JSON.stringify(results));  //MAIN ARRAY
    });
app.get("/eventsList2" , function(req,res){
    res.render("eventsList",{title:"-eventslist", loginName:usn,loginAddress:"StudentProfile" , Events_array : Sup_events_for_reg });
});



app.get("/registration" , function(req,res){
    res.render("registration",{title:"-event_Registration",loginName:usn, pptext:"" , fnamevalue:"",lnamevalue :"",yearvalue : "" , mailvalue : "" , branchvalue:"" , usnvalue:"", loginName:usn ,loginAddress:"StudentProfile" , RegErrTxt:""});
});



// UPCOMING EVENTS
var upcoming_events = [];
app.get("/upcoming" , function(req,res) {

    // upcoming event ==>keeps updating
    connection.query("SELECT * FROM event_date, admin_events WHERE event_date.event_id=admin_events.event_id and reg_start>curdate() ORDER BY admin_events.event_id",function(error,results,fields){
               upcoming_events = JSON.parse(JSON.stringify(results));  //MAIN ARRAY

               // to update the notifications
               connection.query("SELECT * from gen_notifs UNION SELECT dt,info from notifications where event_id in (SELECT event_id FROM user_reg WHERE usn= ? )" ,[usn],function(error,result,field){
                        All_Notify = JSON.parse(JSON.stringify(result));
                        console.log(usn);

               res.render("upcoming", {title:"-upcoming",loginName:usn,loginAddress:"StudentProfile" , UpEvents_array: upcoming_events , Data_AllNotify : All_Notify});
            });
        });
});



app.get("/gallery" , function(req,res){
    // to update the notifications
    connection.query("SELECT * from gen_notifs UNION SELECT dt,info from notifications where event_id in (SELECT event_id FROM user_reg WHERE usn= ? )" ,[usn],function(error,result,field){
        All_Notify = JSON.parse(JSON.stringify(result));
        });
    res.render("gallery",{title:"-gallery",loginName:usn,loginAddress:"StudentProfile" , Data_AllNotify : All_Notify});

});

app.get("/achivements" , function(req,res){
    // to update the notifications
    connection.query("SELECT * from gen_notifs UNION SELECT dt,info from notifications where event_id in (SELECT event_id FROM user_reg WHERE usn= ? )" ,[usn],function(error,result,field){
      All_Notify = JSON.parse(JSON.stringify(result));
    res.render("achivements",{title:"-achivements",loginName:usn,loginAddress:"StudentProfile" , Data_AllNotify : All_Notify});

    });
});




//GET REGISTRATION
 
// app.get("/registration/:Event_forms" , function(req,res){

//     // let Event_Name  = _.lowerCase(req.params.Event_forms);
//      let Event_Id = req.params.Event_forms;

//     console.log("Event_id "+Event_Id);

//     //with query get the evename and pass it
//     let Event_Name = "";
//     let Event_RegisStart = "";
//     let Event_RegisDue = "";
//     let Event_Date = "";
    
//     connection.query("select event_name from admin_events where event_id = ?",[Event_Id],function(error,results,fields)
//     {
//         results  =  JSON.parse(JSON.stringify(results));
//         Regis_Details_2 = results;
         
        
//         connection.query("select * from event_date where event_id=?",[Event_Id],function(error,results,fields){
    
//         Regis_Details_1  =  JSON.parse(JSON.stringify(results));
//         console.log(Regis_Details_1);

//          res.render("registration",{title:"-event_Registration",loginName:usn, pptext:"" , fnamevalue:"",lnamevalue :"",yearvalue : "" , mailvalue : "" , branchvalue:"" , usnvalue:"", loginName:usn ,loginAddress:"StudentProfile"  , Regis_Ename : Event_Name , Regis_Eid : Event_Id  , Data_AllNotify : All_Notify});

//        });

//     }); 
    
// });



// REGISTRATION  ==> GET REQUEST
// PATH ERROR
var Regis_Details_1 = [];
 var Regis_Details_2 = [];
app.get("/registrations/:EVE_ID/regis" ,function(req,res){
   var EVE_ID = req.params.EVE_ID;
    console.log(EVE_ID);


    // notifications
      connection.query("SELECT * from gen_notifs UNION SELECT dt,info from notifications where event_id in (SELECT event_id FROM user_reg WHERE usn= ? )" ,[usn],function(error,result,field){
      All_Notify = JSON.parse(JSON.stringify(result));
      console.log(All_Notify);

    //   Event Details 
       connection.query("select * from admin_events where event_id = ?",[EVE_ID],function(error,results,fields){
        Regis_Details_1  =  JSON.parse(JSON.stringify(results));
      console.log(Regis_Details_1);

    //   Event Date Detils
        connection.query("select * from event_date where event_id=?",[EVE_ID],function(error,result,fields){
    
        Regis_Details_2  =  JSON.parse(JSON.stringify(result));
         console.log(Regis_Details_2);

         res.render("registration",{title:"-event_Registration",loginName:usn, loginAddress:"StudentProfile", Data_AllNotify : All_Notify , Data_Eve_Reg :Regis_Details_1 , Data_Eve_Reg_Date :Regis_Details_2 , Reg_usn : usn , RegErrTxt:""});
   
        });

        });

    });

});



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
  
        // Uploads is the Upload_folder_name
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now()+".pdf")
    }
  });
       
// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 5000;
    
var upload = multer({ 
    storage: storage,
    limits: { fileSize: maxSize },
    // fileFilter: function (req, file, cb){
    
    //     // // Set the filetypes, it is optional
    //     // var filetypes = /jpeg|jpg|png/;
    //     // var mimetype = filetypes.test(file.mimetype);
  
    //     // var extname = filetypes.test(path.extname(
    //     //             file.originalname).toLowerCase());
        
    //     // if (mimetype && extname) {
    //     //     return cb(null, true);
    //     // }
      
    //     // cb("Error: File upload only supports the "
    //     //         + "following filetypes - " + filetypes);
    //   } 
  
// mypic is the name of file attribute
}).single("mypic");       




// RESPONSE AFTER USER GETS REGISTERD 
var Reg_Student_details = [];
var Reg_Event_details = [];
var Reg_Event_Date_details = [];
app.post("/registrations/:Reg_Eve_id/:Reg_Usn" ,function(req,res){
    var REG_Eve_id = req.params.Reg_Eve_id;
    var REG_Usn = req.params.Reg_Usn;

    console.log(REG_Eve_id);
    console.log(REG_Usn);

    connection.query("select * from user_reg where usn = ? and event_id = ? " , [REG_Usn,REG_Eve_id] , function(error , result3 , field){
           result3 = JSON.parse(JSON.stringify(result3));
           console.log(result3);

        if(result3.length>0){
         res.render("registration",{title:"-event_Registration",loginName:usn, loginAddress:"StudentProfile", Data_AllNotify : All_Notify , Data_Eve_Reg :Regis_Details_1 , Data_Eve_Reg_Date :Regis_Details_2 , Reg_usn : usn , RegErrTxt:"You have already registerd ! " });
         res.end();
        }else{
                connection.query("select * from user_login where usn = ? ", [REG_Usn] , function(error,result,field){
                     Reg_Student_details = JSON.parse(JSON.stringify(result));
                     var S_Email = Reg_Student_details[0].email;


                connection.query("select * from admin_events where event_id = ? " ,[REG_Eve_id] , function(error , result1 , field){
                   Reg_Event_details = JSON.parse(JSON.stringify(result1));
                   var Reg_Event_Name = Reg_Event_details[0].event_name;
           
               
                connection.query("select * from event_date where event_id=?",[REG_Eve_id],function(error,result2,fields){
                   Reg_Event_Date_details = JSON.parse(JSON.stringify(result2));
        
                      var mailOptions= {
                        from : 'bmscearena@gmail.com',
                        to: S_Email,
                        subject:'Successfull Registration',
                        // text:'Your otp for this session is '+otpg+'. This will be valid for 120 seconds.'
                        text : 'Congratulations! You have successfully registerd for event '+Reg_Event_Name
                        };
                        transporter.sendMail(mailOptions,function(error, info){
                        if(error)
                        console.log(error);
                        else
                        console.log('Email sent: '+info.response);
                        });
                        
                        
                connection.query("insert into user_reg values(?, ?)",[REG_Usn,REG_Eve_id],function(error,results,fields){   
           
                   console.log(Reg_Event_Date_details);
                   console.log(Reg_Student_details);
                   console.log(Reg_Event_details);
                
                    upload(req,res,function(err) {
                  
                         if(err) {
                   
                             // ERROR occured (here it can be occured due
                             // to uploading image of size greater than
                             // 1MB or uploading different file type)
                             console.log(err)
                         }
                         else {
                             // SUCCESS, image successfully uploaded
                             console.log("Success, Image uploaded!")
                         }
                     });
           
           
                res.render("response" ,  {title:"-Regis_Responsel" , loginAddress:"StudentProfile", loginName:usn  , Data_AllNotify : All_Notify , Data_Regis_Event  : Reg_Event_details, Data_Regis_Student : Reg_Student_details , Data_Regis_Event_Date : Reg_Event_Date_details});
           
                });
            });
         });
    
      });
    }
 });

   
});








app.get("/response" , function(req,res){
 F_name ="";
L_name ="";
Y_ear ="";
U_sn ="";
B_ranch ="";
M_ail ="";

    res.render("response" ,  {title:"-Regis_Responsel" , Fname:"" , Lname:"" , Year:Y_ear , Usn:U_sn , Branch : B_ranch , Mail:M_ail , loginAddress:"StudentProfile",loginName:usn  , Data_AllNotify : All_Notify});
})





// POST REGISTRATION


//  response/<%=Regis_Eid%>
//  <%=Regis_Eid%>
// difference between the above two

// app.post("/registration/:Event_response" , function(req,res){


// //  query to add data using eventid and usn

//    let Eventid_response = req.params.Event_response;

//    console.log("response.........."+Eventid_response);


//     F_name = req.body.fname;
//     L_name = req.body.lname;
//     Y_ear = req.body.year;
//     U_sn = req.body.usn;
//     B_ranch = req.body.branch;
//     M_ail = req.body.mail;

//     if(F_name==""||L_name==""||Y_ear==""||U_sn==""||B_ranch==""||M_ail==""){
//         // res.redirect("//registration/response/:Event_response");
//         res.render("registration",{title:"-event_Registration",loginName:usn , pptext:"***Please fill all the user credentials***" , fnamevalue:F_name ,lnamevalue :L_name,yearvalue :Y_ear , mailvalue :M_ail , branchvalue:B_ranch , usnvalue:U_sn , loginName:usn,  Regis_Ename : "" , Regis_Eid : "", loginAddress:"StudentProfile"  , Data_AllNotify : All_Notify});
//     }
//     else{
//         if(U_sn.length==10){
//             connection.query("select * from user_reg where usn=? && event_id=?",[U_sn,Eventid_response],function(error,results,fields){
//                 console.log(results)
//                 if(results.length>0)
//                 res.render("registration",{title:"-event_Registration",loginName:usn , pptext:"***User has already registered***" , fnamevalue:F_name ,lnamevalue :L_name,yearvalue :Y_ear , mailvalue :M_ail , branchvalue:B_ranch , usnvalue:U_sn , loginName:usn   , Regis_Ename : "" , Regis_Eid : "", loginAddress:"StudentProfile" ,Data_AllNotify : All_Notify });
//                 else
//                 {
//                     connection.query("insert into user_reg values(?, ?, ?, ?, ?, ?,?)",[F_name,L_name,Y_ear,B_ranch,M_ail,U_sn,Eventid_response],function(error,results,fields){
//                     res.render("response", {title:"-Regis_Responsel",loginName:usn , Fname:F_name , Lname:L_name , Year:Y_ear , Usn:U_sn , Branch : B_ranch , Mail:M_ail  , loginName:usn , loginAddress:"StudentProfile"  , Data_AllNotify : All_Notify});
//                     var mailOptions= {
//                     from : 'bmscearena@gmail.com',
//                     to: M_ail,
//                     subject:'Successfull Registration',
//                     text:'Congratulations on successfully registering in this event. \n All the best'
//                     };
//                     transporter.sendMail(mailOptions,function(error, info){
//                     if(error)
//                     console.log(error);
//                     else
//                     console.log('Email sent: '+info.response);
//                 });
//             });
//         }
//         });
            
//         }
//         else
//         res.render("registration",{title:"-event_Registration",loginName:usn , pptext:"***Incorrect USN kidnly check***" , fnamevalue:F_name ,lnamevalue :L_name,yearvalue :Y_ear , mailvalue :M_ail , branchvalue:B_ranch , usnvalue:U_sn , loginName:usn ,  Regis_Ename : "" , Regis_Eid : "",loginAddress:"StudentProfile" , Data_AllNotify : All_Notify});       
// }
// });







// // POST ===> RESPONSE

// app.post("/response" , function(req,res){

// //     F_name ="";
// // L_name ="";
// // Y_ear ="";
// // U_sn ="";
// // B_ranch ="";
// // M_ail ="";

//     F_name = req.body.fname;
//     L_name = req.body.lname;
//     Y_ear = req.body.year;
//     U_sn = req.body.usn;
//     B_ranch = req.body.branch;
//     M_ail = req.body.mail;

//     if(F_name==""||L_name==""||Y_ear==""||U_sn==""||B_ranch==""||M_ail==""){
//         res.render("registration",{title:"-event_Registration",loginName:usn , pptext:"***Please fill all the user credentials***" , fnamevalue:F_name ,lnamevalue :L_name,yearvalue :Y_ear , mailvalue :M_ail , branchvalue:B_ranch , usnvalue:U_sn,loginName:usn,loginAddress:"StudentProfile"});
//     }
//     else{
//     res.render("response", {title:"-Regis_Responsel",loginName:usn , Fname:F_name , Lname:L_name , Year:Y_ear , Usn:U_sn , Branch : B_ranch , Mail:M_ail,loginAddress:"StudentProfile"});
// }
    
// });





// *********************************************    ADMIN    **************************************************************





//ADMIN ==>LOG IN
app.get("/adminLogin" ,function(req,res){
    res.render("AdminLogin", { title:" -ADMIN LOGIN", adminerror:"" , adminpassworderror:"" , adminvalue:"" , adminpasswordvalue:"", loginName:"STUDENT LOGIN" ,loginAddress:""});
});


// CONTENTS
app.get("/DataView1" , function(req,res){
    res.render("DataView1",{title:" -DataView1",  loginName:Aname , loginAddress:"AdminProfile"} );
});



//ADMIN ==> POST REQ ==> HOME PAGE ==> DATA VIEW
var Aname;
var Apassword;
app.post("/DataView1" , function(req,res){
     Aname = req.body.adminname;
     Apassword = req.body.adminpassword;


    console.log("A:"+Aname);
    console.log("A:"+Apassword);

    if(Aname==""&&Apassword==""){
        res.render("AdminLogin",{title:" -ADMIN LOGIN", adminerror:"*****this is required*****" , adminpassworderror:"*****this is required*****" , adminvalue:"" , adminpasswordvalue:"", loginName:"STUDENT LOGIN" ,loginAddress:""});
    }else if(Aname==""){
        res.render("AdminLogin",{title:" -ADMIN LOGIN", adminerror:"*****this is required*****" , adminpassworderror:"" , adminvalue:"" , adminpasswordvalue:Apassword, loginName:"STUDENT LOGIN" ,loginAddress:""});
    }else if(Apassword==""){
        res.render("AdminLogin",{title:" -ADMIN LOGIN", adminerror:"" , adminpassworderror:"*****this is required*****" , adminvalue:Aname, adminpasswordvalue:"", loginName:"STUDENT LOGIN" ,loginAddress:""});
    }else{
        connection.query("select * from admin_login where user_name= ? and passw = ?",[Aname,Apassword],function(error,results,fields){
        if(results.length > 0)
            {
               res.render("DataView1",{title:" -DataView1",  loginName:Aname , loginAddress:"AdminProfile"} ); 
                // res.render("AdmineventsList",{title:" -ADMIN AddEvents", loginName:Aname , loginAddress:"AdmineventsList", EventIdvalue:"" , EventNameValue:"" , StartDateValue:"" , DueDateValue:"" , EventDetailsValue:"",EVEerror:"",EveDateValue:"" });
            }
        else{
            res.render("AdminLogin",{title:" -ADMIN LOGIN", adminerror:"" , adminpassworderror:"Incorrect user name or Password" , adminvalue:Aname, adminpasswordvalue:"", loginName:"STUDENT LOGIN" ,loginAddress:""});
            // res.render("AdmineventsList",{title:" -ADMIN AddEvents", loginName:Aname , loginAddress:"AdmineventsList", EventIdvalue:"" , EventNameValue:"" , StartDateValue:"" , DueDateValue:"" , EventDetailsValue:"" , EVEerror:"" ,EveDateValue:""});
        }
    });
    }
});


//ADMIN ==>AFTER ADDING EVENTS
app.get("/AdminAddedEvent",function(req,res){
    res.render("AdminAddedEvent",{title:" -Event_Added",  loginName:Aname , loginAddress:"AdminProfile"});
});





//ADMIN ==> GET REQ ==>CREATE EVENTS PAGE
app.get("/AdmineventsList", function(req,res){
    res.render("AdmineventsList",{title:" -ADMIN AddEvents", loginName:Aname , loginAddress:"AdminProfile", EventIdvalue:E_ventId , EventNameValue:E_ventName , StartDateValue:S_tartDate , DueDateValue:D_ueDate , EventDetailsValue: E_ventDetails ,EveDateValue:E_ventDate ,EVEerror:""})
});
// the value assinged can be left blank as they dont depict any value! unless we have a post route hit atleast once!





// ADMIN ==>EVENT ADDED SUCCESSFULLY
var E_ventId;
var E_ventName;
var S_tartDate;
var D_ueDate;
var E_ventDate;
var E_ventDetails;
app.post("/AdminAddedEvent", function(req,res){


    E_ventId = req.body.EventId;
    E_ventName = req.body.EventName;
    S_tartDate = req.body.StartDate;
    // reg_start
    D_ueDate = req.body.DueDate; 
    // reg_due
    E_ventDate = req.body.EveDate;
    // event_start
    E_ventDetails = req.body.EventDetails;

    console.log(E_ventId);
    console.log(E_ventName);
    console.log(S_tartDate);
    console.log(E_ventDetails);


    if(E_ventId==""||E_ventName==""||S_tartDate==""||D_ueDate==""||E_ventDetails==""||E_ventDate==""){
        // res.render("AdmineventsList",{title:" -ADMIN AddEvents", loginName:Aname , loginAddress:"AdmineventsList", EventIdvalue:E_ventId , EventNameValue:E_ventName , StartDateValue:S_tartDate , DueDateValue:D_ueDate , EventDetailsValue: E_ventDetails ,EveDateValue:E_ventDate, EVEerror:"** Please fill all the details **"})
        res.render("AdmineventsList",{title:" -ADMIN AddEvents", loginName:Aname , loginAddress:"AdminProfile", EventIdvalue:E_ventId , EventNameValue:E_ventName , StartDateValue:S_tartDate , DueDateValue:D_ueDate , EventDetailsValue: E_ventDetails ,EveDateValue:E_ventDate, EVEerror:"** Please fill all the details **"})
    }else{
        connection.query("select * from admin_events where event_id=?",[E_ventId],function(error,results,fields){
                // res.render("AdminAddedEvent",{title:" -Event_Added",  loginName:Aname , loginAddress:"AdminAddedEvent",EVENTname:E_ventName , EVENTid:E_ventId , STARTdate: S_tartDate , DUEdate: D_ueDate , EVENTdetails: E_ventDetails , EVEdate  :E_ventDate });
                if(results.length>0)
                res.render("AdmineventsList",{title:" -ADMIN AddEvents", loginName:Aname , loginAddress:"AdminProfile", EventIdvalue:E_ventId , EventNameValue:E_ventName , StartDateValue:S_tartDate , DueDateValue:D_ueDate , EventDetailsValue: E_ventDetails ,EveDateValue:E_ventDate, EVEerror:"** Event already exists **"})
                else if(E_ventDate<S_tartDate || E_ventDate<D_ueDate || D_ueDate<S_tartDate)
                res.render("AdmineventsList",{title:" -ADMIN AddEvents", loginName:Aname , loginAddress:"AdminProfile", EventIdvalue:E_ventId , EventNameValue:E_ventName , StartDateValue:S_tartDate , DueDateValue:D_ueDate , EventDetailsValue: E_ventDetails ,EveDateValue:E_ventDate, EVEerror:"** Recheck the entered dates **"})
                else{
                    connection.query("insert into admin_events values(?,?,?)",[E_ventName,E_ventDetails,E_ventId],function(error1,results1,fields1){
                    connection.query("insert into event_date values(?,?,?,?)",[S_tartDate,D_ueDate,E_ventDate,E_ventId],function(error2,results2,fields2){
                res.render("AdminAddedEvent",{title:" -Event_Added",  loginName:Aname , loginAddress:"AdminProfile",EVENTname:E_ventName , EVENTid:E_ventId , STARTdate: S_tartDate , DUEdate: D_ueDate , EVENTdetails: E_ventDetails , EVEdate  :E_ventDate });
                console.log(error1);
                console.log(error2);
            });
        });
            }
                
                console.log(error);
        });
    }
});





// STUDENT DETAILS
var Student_Details = [];
connection.query("Select * from user_login ORDER BY usn",function(error,result,fields){
    Student_Details = JSON.parse(JSON.stringify(result));
});
app.get("/DataViewStudent" , function(req,res){
    console.log(Student_Details);

    res.render("DataViewStudent",{title:" -DataViewStudent",  loginName:Aname , loginAddress:"AdminProfile" , Data_Students :Student_Details , Event_Details:"" ,Event_Name:"" });
});





// ALL EVENTS
var All_events = [];
connection.query("select * from admin_events join event_date where admin_events.event_id=event_date.event_id ORDER BY admin_events.event_id",function(error,results1,fields){
All_events=JSON.parse(JSON.stringify(results1))
    // console.log(All_events);
});
app.get("/DataViewAllEvents" , function(req,res){
    console.log(All_events);
    res.render("DataViewAllEvents",{title:" -DataViewAllEvents",  loginName:Aname , loginAddress:"AdminProfile" , Data_All_events : All_events} );
});




// EVENTS REGIS AVAIALABLE
connection.query("SELECT * FROM event_date, admin_events WHERE event_date.event_id=admin_events.event_id and (reg_start<=curdate() and  reg_due>=curdate()) order by admin_events.event_id",function(error,results,fields){
    Data_events_for_reg = JSON.parse(JSON.stringify(results));  //MAIN ARRAY
});
app.get("/DataViewEventsRegis" , function(req,res){

        // console.log(Data_events_for_reg);
    res.render("DataViewEventsRegis",{title:" -DataViewUpEventsRegisAvailable",  loginName:Aname , loginAddress:"AdminProfile"  , Data_Events_Reg : Data_events_for_reg} );
});


// EVENTS REGIS CLOSED
var Data_events_closed_reg= [];
app.get("/DataViewEventsNotRegis" , function(req,res){

    
    connection.query("SELECT * FROM event_date, admin_events WHERE event_date.event_id=admin_events.event_id and (curdate()>reg_due) order by admin_events.event_id",function(error,results,fields){
        Data_events_closed_reg = JSON.parse(JSON.stringify(results));  //MAIN ARRAY
        console.log(Data_events_closed_reg);

    res.render("DataViewEventsNotRegis",{title:" -DataViewUpEventsRegisClosed",  loginName:Aname , loginAddress:"AdminProfile"  , Data_EventsClosed : Data_events_closed_reg} );
    // res.render("DataViewEventsNotRegis",{title:" -DataViewUpEventsRegisClosed",  loginName:Aname , loginAddress:"DataViewEventsNotRegis",  Data_EventsClosed : Data_events_closed_reg} );
        }); 
});



// UPCOMING EVENTS
app.get("/DataViewUpEvents" , function(req,res){
     connection.query("SELECT * FROM event_date, admin_events WHERE event_date.event_id=admin_events.event_id and reg_start>curdate() ORDER BY admin_events.event_id",function(error,results,fields){
           upcoming_events = JSON.parse(JSON.stringify(results));  //MAIN ARRAY

        res.render("DataViewUpEvents",{title:" -DataViewUpcomingEvents",  loginName:Aname , loginAddress:"AdminProfile"  , Data_events_upcome : upcoming_events} );
    });

});


//ADMIN ==> CREATE NOTIFUCATION
var SuNotifyTxt=[];
app.get("/NotifyCreate",function(req,res){
    res.render("NotifyCreate",{title:" -AdminNotifyCreate",  loginName:Aname , loginAddress:"AdminProfile" , NErrtxt:"" , SuNotifyTxt:""} );
});



// ADMIN  ==> NOTIFICATION CREATED SUCCESSFULLY
app.post("/NotifyCreate",function(req,res){

    var N_Event_id = req.body.NEventId;
    var N_Event_Notify = req.body.NEventNotify;

    console.log(N_Event_id);
    console.log(N_Event_Notify);

    if(N_Event_id==0&&N_Event_Notify==0){
    res.render("NotifyCreate",{title:" -AdminNotifyCreate",  loginName:Aname , loginAddress:"AdminProfile" , NErrtxt:"Enter the Details!" , SuNotifyTxt:""} );
    }
    else if(N_Event_Notify==0){
    res.render("NotifyCreate",{title:" -AdminNotifyCreate",  loginName:Aname , loginAddress:"AdminProfile" , NErrtxt:"Enter the Details!" , SuNotifyTxt:""} );
    }else{
        if(N_Event_id==0){
            connection.query("insert into gen_notifs VALUES(current_timestamp(),?)",[N_Event_Notify],function(err,res,fld){
                // console.log(err);
            });
        res.render("NotifyCreate",{title:" -AdminNotifyCreate",  loginName:Aname , loginAddress:"AdminProfile" , NErrtxt:"" , SuNotifyTxt:"Added Succesfully!"} );

        }else{
            // ADD to Notifiaction Tabel (old one where event_id is PK)
            // no validation needed timestamp dynamic
            connection.query("insert into notifications VALUES(?,current_timestamp(),?)",[N_Event_id,N_Event_Notify],function(err,res,fld){
                // console.log(err);
            }); 
        res.render("NotifyCreate",{title:" -AdminNotifyCreate",  loginName:Aname , loginAddress:"AdminProfile" , NErrtxt:"" , SuNotifyTxt:"Added Succesfully!"} );
        }
    }
});

    
// ADMIN  ==> STUDENTS DETAILS REGISTERD FOR PARTICULAR EVENT
var Students_reg_event = [];
app.get("/DataViewEventsRegis/:EVEid/Sdata",function(req,res){
    var EVE_id = req.params.EVEid;
    console.log(EVE_id);

    connection.query("select * from admin_events where event_id = ?", [EVE_id] , function(error,result1,field){
        Event_info = JSON.parse(JSON.stringify(result1));
        console.log(Event_info);
        var EVE_name = Event_info[0].event_name;
        console.log(EVE_name);

    connection.query("select * from user_login where usn in (select usn from user_reg where event_id=?) ORDER BY usn",[EVE_id] , function(error,result,field){
        Students_reg_event = JSON.parse(JSON.stringify(result)); 
        console.log(Students_reg_event);
   

       res.render("DataViewStudent",{title:" -DataViewStudent",  loginName:Aname , loginAddress:"AdminProfile" , Data_Students :Students_reg_event , Event_Details : "The following students have registered for the Event"  , Event_Name:EVE_name});
//        // the name of EJS is not related to the GET route REQUEST
         });

    } );

});





app.get("/DataViewEventsNotRegis/:EVEid/Sdata",function(req,res){
    var EVE_id = req.params.EVEid;
    console.log(EVE_id);

    connection.query("select * from admin_events where event_id = ?", [EVE_id] , function(error,result1,field){
        Event_info = JSON.parse(JSON.stringify(result1));
        console.log(Event_info);
        var EVE_name = Event_info[0].event_name;
        console.log(EVE_name);

    connection.query("select * from user_login where usn in (select usn from user_reg where event_id=?) ORDER BY usn",[EVE_id] , function(error,result,field){
        Students_reg_event = JSON.parse(JSON.stringify(result)); 
        console.log(Students_reg_event);
   

       res.render("DataViewStudent",{title:" -DataViewStudent",  loginName:Aname , loginAddress:"AdminProfile" , Data_Students :Students_reg_event , Event_Details : "The following students have registered for the Event"  , Event_Name:EVE_name});
//        // the name of EJS is not related to the GET route REQUEST
         });

    } );

});



//STUDENT PROFILE
app.get("/StudentProfile" , function(req,res){
var Student_profile = [];

    connection.query("select * from user_login where usn = ?", [usn] , function(error,result,field){
        Student_profile = JSON.parse(JSON.stringify(result)); 
        console.log(Student_profile);
    res.render("StudentProfile",{title:"-StudentProfile",loginName:usn,loginAddress:"StudentProfile" , Data_AllNotify : All_Notify  , Data_S_profile :Student_profile });

    });
    
});

app.get("/AdminProfile" , function(req,res){
var Admin_profile = [];

    connection.query("select * from admin_login where user_name = ?", [Aname] , function(error,result,field){
        Admin_profile = JSON.parse(JSON.stringify(result)); 
        console.log(Admin_profile);

    res.render("AdminProfile",{title:"-AdminProfile",loginName:usn,loginAddress:"AdminProfile" , Data_S_profile : Admin_profile});

    });
    
});



function date_display(x) {
    
}



//The following students have registered for the Event

app.listen("3000",function(){
    console.log("Successfully Running");
});