const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const { getStream } = require('drive-stream');
const axios = require('axios').default;

app.get('/urls/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await getStream(id);
        if (!data) throw new Error('No data');
        const urls = [];
        const proxyHost = req.headers["x-forwarded-host"];
        const protocol = req.protocol;
        const host = proxyHost ? proxyHost : req.headers.host;
        const baseUrl = `${protocol}://${host}`;
        Object.keys(data).forEach(key => {
            if (key !== 'cookie') {
                const url = baseUrl + `/stream/${id}/${key}`;
                urls.push(url);
            }
        })
        res.json(urls);
    } catch (error) {
        console.log(error);
        const errMsg = error?.response?.data || error?.message || error;
        res.status(500).json({ error: errMsg });
    }
});

app.get('/stream/:id/:resolution', async (req, res) => {
    try {
        const id = req.params.id;
        const resolution = req.params.resolution || '720P';

        const data = await getStream(id);
        const range = req.headers.range || 'bytes=0-';

        const url = data[resolution];
        if (!url) throw new Error('Video url not found');
        const cookie = data?.cookie;
        const opt = {
            method: 'get',
            url,
            headers: {
                'Cookie': cookie,
                'Range': range
            },
        }
        const resData = await axios({
            ...opt,
            headers: {
                ...opt.headers,
                'Range': 'bytes=0-1',
            }
        });
        if (!resData) throw new Error('No data');
        const resHeaders = resData.headers;
        const totalLength = resHeaders['content-range']?.split('/')[1];
        const start = parseInt(range.split('=')[1].split('-')[0]);
        const end = parseInt(range.split('=')[1].split('-')[1] || totalLength);
        const contentLength = end - start;

        const headers = {
            "Content-Range": `bytes ${start}-${end-1}/${totalLength}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };

        // HTTP Status 206 for Partial Content
        res.writeHead(206, headers);
        const axiosResp = await axios({
            ...opt,
            responseType: 'stream',
        });
        axiosResp.data.pipe(res);
    } catch (error) {
        console.log(error);
        const errMsg = error?.response?.data || error?.message || error;
        res.status(500).json({ error: errMsg });
    }
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});