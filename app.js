import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

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
app.use(cors());
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

  // 조회수 증가
  wiseSayingRow.hitCount++; // 방법 1. hitCount을 증가시키고 query에 ?를 넣어줌

  await pool.query(
    `
    UPDATE wise_saying
    SET hitCount = ? 
    WHERE id = ?
    `,
    [wiseSayingRow.hitCount, wiseSayingRow.id] // 랜덤으로 뽑힌 데이터(wiseSayingRow)의 id 값
  );

  // wiseSayingRow.hitCount++; // 방법 2. query에 SET hitCount = hitCount+1을 넣고 나중에 증가시켜줌

  res.json({
    resultCode: "S-1",
    msg: "성공",
    data: wiseSayingRow,
  });
});

// 수정
app.patch("/wise-sayings/:id", async (req, res) => {
  const { id } = req.params;
  const [[wiseSayingRow]] = await pool.query(
    `
    SELECT *
    FROM wise_saying
    WHERE id = ?
    `,
    [id]
  );

  if (wiseSayingRow === undefined) {
    res.status(404).json({
      resultCode: "F-1",
      msg: "404 not found",
    });
    return;
  }

  // 수정 할 수 있는 데이터
  const {
    // content, author, goodLikeCount, badLikeCount -> 하나만 수정할라고 해도 데이터를 다 적어야 함, 만약 안적으면 값은 undefined 값이 나옴
    content = wiseSayingRow.content, // req.body 안에 content가 없으면 wiseSayingRow.content이 들어간다. 즉, 값을 적지 않으면 수정이 안되고 기존 데이터 그래도 사용 가능
    author = wiseSayingRow.author,
    goodLikeCount = wiseSayingRow.goodLikeCount,
    badLikeCount = wiseSayingRow.badLikeCount,
  } = req.body; // req.body에서 수정할 데이터를 받아 옴

  // 수정한 데이터를 db에!
  await pool.query(
    `
    UPDATE wise_saying
    SET content = ?,
    author = ?,
    goodLikeCount = ?,
    badLikeCount = ?
    WHERE id = ?
    `,
    [content, author, goodLikeCount, badLikeCount, id]
  );

  // 수정 된 db 데이터를 다시 불러옴
  const [[justModifiedWiseSayingRow]] = await pool.query(
    `
    SELECT *
    FROM wise_saying
    WHERE id = ?
    `,
    [id]
  );

  res.json({
    resultCode: "S-1",
    msg: "성공",
    data: justModifiedWiseSayingRow,
  });
});

app.listen(port, () => {
  console.log(`Wise saying app listening on port ${port}`);
});
