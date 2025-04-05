import React, { useState, useEffect } from 'react';
import { Row, Col } from "react-bootstrap";
import MusicPlayer from "../components/MusicPlayer";
import { MusicContext } from "../MusicContext";
import { Typography, TextField, Button, Box, CardContent } from '@mui/material';
import { Card as BootstrapCard } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Timer = () => {
  const [studyTime, setStudyTime] = useState(25); // Mặc định 25 phút (Pomodoro)
  const [breakTime, setBreakTime] = useState(5); // Mặc định 5 phút (Pomodoro)
  const [seconds, setSeconds] = useState(studyTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [isStudy, setIsStudy] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isActive && seconds === 0) {
      setIsStudy(!isStudy);
      setSeconds((isStudy ? breakTime : studyTime) * 60);
      toast.info(isStudy ? 'Hết thời gian học! Bắt đầu nghỉ ngơi.' : 'Hết thời gian nghỉ! Bắt đầu học.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, isStudy, studyTime, breakTime]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds((isStudy ? studyTime : breakTime) * 60);
    setIsStudy(true); // Quay lại trạng thái học
  };

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const TimerComponent = () => (
    <BootstrapCard className="card-custom">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Bộ đếm ngược
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: 'text.secondary' }}>
          Phương pháp Pomodoro: Học 25 phút, nghỉ 5 phút. Hãy tập trung học trong 25 phút, sau đó thư giãn 5 phút để tăng hiệu quả!
        </Typography>
        <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary' }}>
          Lợi ích: Tăng khả năng tập trung, giảm mệt mỏi và cải thiện hiệu suất so với học liên tục không nghỉ.
        </Typography>
        <Typography variant="h3" align="center" gutterBottom>
          {formatTime()}
        </Typography>
        <Box mt={2}>
          <TextField
            label="Thời gian học (phút)"
            type="number"
            value={studyTime}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > 0) {
                setStudyTime(value);
                if (!isActive && isStudy) {
                  setSeconds(value * 60);
                }
              }
            }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Thời gian nghỉ (phút)"
            type="number"
            value={breakTime}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > 0) {
                setBreakTime(value);
                if (!isActive && !isStudy) {
                  setSeconds(value * 60);
                }
              }
            }}
            fullWidth
            margin="normal"
          />
          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStart}
              disabled={isActive}
              fullWidth
            >
              Bắt đầu
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleStop}
              disabled={!isActive}
              fullWidth
            >
              Dừng
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleReset}
              fullWidth
            >
              Reset
            </Button>
          </Box>
        </Box>
      </CardContent>
    </BootstrapCard>
  );

  return (
    <Row className="g-4">
      <Col md={6}>
        <MusicContext.Consumer>
          {({ stopMusic }) => <TimerComponent onTimerEnd={stopMusic} />}
        </MusicContext.Consumer>
      </Col>
      <Col md={6}>
        <MusicPlayer />
      </Col>
    </Row>
  );
};

export default Timer;