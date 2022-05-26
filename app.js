import express from "express";
import mysql from "mysql2/promise";

// db 연결
const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "project1_4_220526",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // 날짜,시간을 깔끔하게 보여주기 위해서 설정
});

const app = express();
app.use(express.json());
const port = 3000;

// 단건조회
app.get("/wise-sayings/random", async (req, res) => {
  const [[wiseSayingRow]] = await pool.query(
    //[[wiseSayingRow]]  값이 한건만 나오니 []안에 넣어줌
    `
    SELECT *
    FROM wise_saying
    ORDER BY RAND()
    LIMIT 1
    `
  );

  if (wiseSayingRow == undefined) {
    res.status(404).json({
      resultCode: "F-1",
      msg: "404 not found",
    });
    return;
  }

  res.json({
    resultCode: "S-1",
    msg: "성공",
    data: wiseSayingRow,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
