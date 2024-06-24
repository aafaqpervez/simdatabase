// const express = require('express');
// const axios = require('axios');
// const path = require('path');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve static files from the "public" directory
// app.use(express.static(path.join(__dirname, 'public')));

// app.post('/proxy', async (req, res) => {
//     const { number } = req.body;

//     // Validate the number
//     if (number.length !== 13 && number.length !== 10 && number.length !== 11) {
//         return res.status(400).json({ success: false, message: 'Invalid number length' });
//     }

//     try {
//         const postData = new URLSearchParams({
//             action: 'get_number_data',
//             searchdata: number
//         }).toString();

//         console.log('Post Data:', postData);

//         const response = await axios.post('https://simownerdata.pk/', postData, {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             }
//         });

//         console.log('Response Data:', response.data);

//         res.json(response.data);
//     } catch (error) {
//         console.error('Error:', error.response ? error.response.data : error.message);
//         res.status(500).json({ success: false, message: 'Error fetching data from the target site' });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/search', async (req, res) => {
    const searchdata = req.body.searchdata;
    const type = req.body.type;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the external website
    await page.goto('https://simownerdata.pk');

    // Fill in the data
    await page.type('#searchdata', searchdata);

    // Submit the form
    await page.click('.search-submit');

    // Wait for the response
    await page.waitForNavigation();

    // Once you have the response, you can retrieve it and send it back to the client
    const response = await page.content();

    // Close the browser
    await browser.close();

    // Send the response back to the client
    res.send(response);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

