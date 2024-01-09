//import library
const express = require('express')//เป็น pattern ใช้ express
const bodyparser = require('body-parser')//เป็น pattern ใช้ body-parser
const app = express() //เป็น pattern ใช้ express
const cors = require('cors')
const mysql = require('mysql2/promise')

app.use(bodyparser.json())
app.use(cors())

const port = 8000

// let users = []
// let counter = 1

let conn =null

const validateData = (userData) => {
    let errors = []
  
    if (!userData.firstname){
      errors.push('กรุณาใส่ชื่อจริง')
    }
    if (!userData.lastname){
      errors.push('กรุณาใส่นามสกุล')
    }
    if (!userData.age){
      errors.push('กรุณาใส่อายุ')
    }
    if (!userData.gender){
      errors.push('กรุณาเลือกเพศ')
    }
    if (!userData.interests){
      errors.push('กรุณาเลือกความสนใจ')
    }
    if (!userData.description){
      errors.push('กรุณาใส่รายละเอียดของคุณ')
    }
  
    return errors
  }


const inintMySQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'restapi'//,
        //port: 3306 //defaul port
    })
}

// app.get('/testdb', (req,res) => {
//     mysql.createConnection({
//         host: 'localhost',
//         user: 'root',
//         password: 'root',
//         database: 'restapi'//,
//         //port: 3306 //defaul port
//     }).then((conn) => {
//         // สิ่งนี้เราเรียกกันว่า promise
//         conn
//         .query('SELECT * FROM users')
//         .then((results) => {
//         res.json(results[0])
//         })
//         .catch((error) => {
//         console.error('Error fetching users:', error.message)
//         res.status(500).json({ error: 'Error fetching users' })
//         })//status 404 not found 200 ok 500 error
//     })
// })

//use async await สวยกว่า ตรงไปตรงมากว่า ใช้มากกว่า
app.get('/testdb-new', async (req,res) => {
    try{
    // const conn = await mysql.createConnection({
    //         host: 'localhost',
    //         user: 'root',
    //         password: 'root',
    //         database: 'restapi'//,
    //         //port: 3306 //defaul port
    //     }) // ********* ทำการประกาศ conn ไว้ข้างบนแล้ว **************

        const results = await conn.query('SELECT * FROM users')
        res.json(results[0])
    }catch(error){
        console.error('Error fetching users:', error.message)
        res.status(500).json({ error: 'Error fetching users' })
    }  
})


//creat path = เรียกว่า / และมีตัวแปล req, res
// app.get('/test', (req,res)=>{
//     let user = {
//         firstname: 'test',
//         lastname: 'นามสกุล',
//         age: 14 
//     }
//     //res.send('Hello world')
//     res.json(user)
// })


/*
GET /users สำหรับ get users ทั้งหมดที่บันทึกเข้าไปออกมา
POST /users สำหรับการสร้าง users ใหม่บันทึกเข้าไป
GET /users/:id สำหรับการดึง users รายคนออกมา
PUT /users/:id สำหรับการแก้ไข users รายคน (ตาม id ที่บันทึกเข้าไป)
DELETE /users/:id สำหรับการลบ users รายคน (ตาม id ที่บันทึกเข้าไป)
*/



//PATH = GET /users สำหรับ get users ทั้งหมดที่บันทึกเข้าไปออกมา
app.get('/users',async(req, res) => {
    try{
        const results = await conn.query('SELECT * FROM users')
        res.json(results[0])
    }catch(error){
        console.error('Error fetching users:', error.message)
        res.status(500).json({ error: 'Error fetching users' })
    }  
})


//path = POST /users สำหรับการสร้าง users ใหม่บันทึกเข้าไป
app.post('/users',async (req,res)=>{
    // let user = req.body
    // user.id = counter
    // counter += 1
    // //console.log('user',user) ใช้รวมกับ postman
    // users.push(user)
    // res.json({
    //     message:'add ok',
    //     user: user
    // })
    try{
        let user = req.body

        const errors = validateData(user)
        if(errors.length > 0){
            throw{
                message:'กรอกข้อมูลไม่ครบ',
                errors: errors
            }
        }
        const results = await conn.query('INSERT INTO users SET ?', user)
        res.json({
            message: 'insert ok',
            data: results[0]
        })
    }catch (error) {
        const errorMessage = error.message || 'something wrong'; // เพิ่ม handle message
        const errors = error.errors || [];
        console.error('error message', error.message);
        res.status(500).json({
            message: errorMessage,
            errors: errors, // Corrected property name
        });
    }
    
   //console.log('results',results)

})

//GET /users/:id สำหรับการดึง users รายคนออกมา
app.get('/users/:id',async(req, res) => {
    try{
        let id = req.params.id
        const results = await conn.query('SELECT * FROM users WHERE id = ?',id)
        
        // handle error 2
        if(results[0].length == 0){
            throw { statusCode: 404, message: 'หาไม่เจอ'}
        }
        res.json(results[0][0])

        // handle error 1
        // if(results[0].length > 0){
        //     res.json(results[0][0])
        // }else{
        //     throw new Error('หาไม่เจอ') // case 1 มันจะโยน error ไปให้  catch
        //     // res.status(404).json({  //case 2
        //     //     message: 'หาไม่เจอ' 
        //     // })
        // }
        //res.json(results[0])//ได้เป็น array
        //res.json(results[0][0])//ได้เป็น obj จะมีโอกาสพังเมื่อ หาข้อมูลไม่เจอเลยต้องใช้ if ช่วยด้านบน
    }catch(error){
        console.error('error message', error.message) ///ฝั่งเราเห็น
        let statusCode = error.statusCode || 500 // handle status code ระหว่าง 404 , 500 จาก handle error 2
        res.status(statusCode).json({
            message: 'somthing wrong',
            //errorMessage: error.message //user จะเห็นerror เลยไม่ใช้ไป consoleข้างบน
        })
    }
})


//PUT /users/:id สำหรับการแก้ไข users รายคน (ตาม id ที่บันทึกเข้าไป)
app.put('/users/:id', async(req, res)=>{
    // let id = req.params.id // params ส่ง ได้กับที่ method
    // let updateUser = req.body
    // // หา user จาก id ที่ส่งมา 
    // // updata users นั้น
    // // users ที่ update ใหม่กลับเข้าไปที่ users ตัวเดิม

    // // let selectedIndex = users.findIndex(user => {
    // //     if(user.id == id){
    // //         return true
    // //     }else{
    // //         return false
    // //     }
    // // }) // reture true false เหมือนกัน แบบย่อข่างล่าง
    // let selectedIndex = users.findIndex(user => user.id == id)
    // // update ข้อมูล user
    // users[selectedIndex].firstname = updateUser.firstname || users[selectedIndex].firstname
    // users[selectedIndex].lastname = updateUser.lastname || users[selectedIndex].lastname
    // users[selectedIndex].age = updateUser.age || users[selectedIndex].age
    
    // res.json({
    //     message: 'update user complete!',
    //     data:{
    //         user: updateUser,
    //         indexUpdate: selectedIndex
    //     }

    // }) 

    try{
        let id = req.params.id
        let updateUser = req.body
        const results = await conn.query('UPDATE users SET ? WHERE id = ?', [updateUser,id])
        res.json({
            message: 'update ok',
            data: results[0]
        })
    }catch (error){
        console.error('error message', error.message) ///ฝั่งเราเห็น
        res.status(500).json({
            message: 'somthing wrong',
            //errorMessage: error.message //user จะเห็นerror เลยไม่ใช้ไป consoleข้างบน
        })
    }
})

//Patch คล้ายๆ put แล้วแต่เคส ถ้าเจาะจ field ใช้ patch
app.patch('/users/:id',(req, res)=>{
    let id = req.params.id // params ส่ง ได้กับที่ method
    let updateUser = req.body
    
    let selectedIndex = users.findIndex(user => user.id == id)
    // update ข้อมูล user
    if(updateUser.firstname){
        users[selectedIndex].firstname = updateUser.firstname
    }
    if(updateUser.lastname){
        users[selectedIndex].lastname = updateUser.lastname
    }
    if(updateUser.age){
        users[selectedIndex].age = updateUser.age
    }
    
    res.json({
        message: 'update user complete!',
        data:{
            user: updateUser,
            indexUpdate: selectedIndex
        }

    }) 
})

//path DELETE /users/:id สำหรับการลบ users รายคน (ตาม id ที่บันทึกเข้าไป)
app.delete('/users/:id',async(req,res) =>{
    // let id = req.params.id
    // // หาก่อนว่า index ของ user ที่จะลบคือ index ไหน
    // let selectedIndex = users.findIndex(user => user.id == id)
    
    // // ลบ เป็นค่า null
    // //delete users[selectedIndex]
    // // ลบ ไม่เป็นค่า null
    // users.splice(selectedIndex,1)

    try{
        let id = req.params.id
        const results = await conn.query('DELETE from users WHERE id = ?', id)
        res.json({
            message: 'delete ok',
            data: results[0]
        })
    }catch (error){
        console.error('error message', error.message) ///ฝั่งเราเห็น
        res.status(500).json({
            message: 'somthing wrong',
            //errorMessage: error.message //user จะเห็นerror เลยไม่ใช้ไป consoleข้างบน
        })
    }
})

app.listen(port,async(req,res)=>{
    await inintMySQL() //มาเรียก เพื่อ ติดต่อ connecttion
    console.log('http server run at ' + port)
})