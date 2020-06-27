const express = require('express')
const path = require('path')
const { Client } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser')

const connectionString = 'postgres://abiuomaqaqcekc:788f4c14b16e626493aff13c8fbdfa2000e94033d18dc55081ba62e4cc778adc@ec2-54-80-184-43.compute-1.amazonaws.com:5432/devlhriq26ea6b'

const PORT = process.env.PORT || 5000
const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.listen(PORT, () => console.log(`Listening on ${PORT}`))


const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

//STAFF
app.post('/api/staff/register', (request, response) => {
  const branchId = request.query.branchId
  const name = request.query.name
  const email = request.query.email
  const password = request.query.password

  try {
    client.query("INSERT INTO staff (branch_id, staff_name, staff_email, staff_password, staff_created_at) VALUES ($1, $2, LOWER($3), $4, current_timestamp);",
      [branchId, name, email, password],
      (err, res) => {
        response.send(res.rows)
      })
  } catch (error) {
    console.log(error)
  }
})

app.get('/api/staff/login', (request, response) => {
  const email = request.query.email
  const password = request.query.password
  try {
    client.query("SELECT * FROM staff WHERE (staff_email = LOWER($1) AND staff_password = $2);", [email, password], (err, res) => {
      response.send(res.rows)
    });
  } catch (error) {
    console.error(error)
  }
})

app.get('/api/staff/all', (request, response) => {
  try {
    client.query("SELECT * FROM staff;", (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

//CUSTOMER
app.post('/api/customer/register', (request, response) => {
  const name = request.query.name
  const email = request.query.email
  const password = request.query.password

  try {
    client.query("INSERT INTO customer (customer_name, customer_email, customer_password, customer_created_at) VALUES ($1, LOWER($2), $3, current_timestamp);",
      [name, email, password],
      (err, res) => {
        response.send(res.rows)
      })
  } catch (error) {
    console.log(error)
  }
})

app.get('/api/customer/all', (request, response) => {
  try {
    client.query("SELECT * FROM customer;", (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

app.get('/api/customer', (request, response) => {
  const email = request.query.email
  try {
    client.query("SELECT * FROM customer WHERE customer_email = $1", [email], (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

//PRODUCT
app.post('/api/product/add', (request, response) => {
  const suppilerId = request.query.supplierId
  const categoryId = request.query.categoryId
  const productName = request.query.productName
  const productPrice = request.query.productPrice
  const productImage = request.query.productImage
  const productQuantity = request.query.productQuantity

  try {
    client.query("INSERT INTO product (supplier_id, category_id, product_name, product_price, product_image, product_quantity, product_created_at)" +
      "VALUES ($1, $2, $3, $4, $5, $6, current_timestamp);",
      [suppilerId, categoryId, productName, productPrice, productImage, productQuantity],
      (err, res) => {
        response.send(res.rows)
      })
  } catch (error) {
    console.log(error)
  }
})

app.get('/api/product/all', (request, response) => {
  try {
    client.query('SELECT * FROM product;', (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

//BRANCH
app.get('/api/branch/all', (request, response) => {
  try {
    client.query("SELECT * FROM branch;", (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

//CATEGORY
app.get('/api/category/all', (request, response) => {
  try {
    client.query("SELECT * FROM category;", (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

//Supplier
app.get('/api/supplier/all', (request, response) => {
  try {
    client.query("SELECT * FROM supplier;", (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

//Order
app.get('/api/order/all', (request, response) => {
  try {
    client.query("SELECT orders.order_id, orders.order_at, branch_id, customer_name, staff_name FROM orders INNER JOIN customer ON orders.customer_id = customer.customer_id INNER JOIN staff ON orders.staff_id = staff.staff_id;", (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

app.post('/api/order/add', (request, response) => {
  const customerId = request.query.customerId
  const staffId = request.query.staffId
  try {
    client.query("INSERT INTO orders (customer_id, staff_id, order_at) VALUES ($1, $2, current_timestamp);", [customerId, staffId], (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

//Order Detail
app.post('/api/order-detail/add', (request, response) => {
  const orderId = request.query.orderId
  const productId = request.query.productId
  const quantity = request.query.quantity
  try {
    client.query("INSERT INTO order_detail (order_id, product_id, order_detail_quantity) VALUES ($1, $2, $3);", [orderId, productId, quantity], (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

app.get('/api/order-detail/all', (request, response) => {
  const orderId = request.query.orderId
  try {
    client.query("SELECT orders.order_id, product_name, order_at, product_price, order_detail_quantity, staff_name, customer_name, branch_id FROM orders INNER JOIN order_detail ON orders.order_id = order_detail.order_id INNER JOIN staff ON orders.staff_id = staff.staff_id INNER JOIN customer ON customer.customer_id = orders.customer_id INNER JOIN product ON order_detail.product_id = product.product_id WHERE orders.order_id = $1;", [orderId], (err, res) => {
      response.send(res.rows)
    })
  } catch (error) {
    console.log(error)
  }
})

//note