import React, { useState, useEffect, useContext } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "../AuthContext";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  CardContent,
} from "@mui/material";
import { Card as BootstrapCard } from "react-bootstrap";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";

// Thêm CSS inline để giữ tỷ lệ khung hình 16:9
const videoContainerStyle = {
  position: "relative",
  paddingBottom: "56.25%", // Tỷ lệ 16:9 (9/16 = 56.25%)
  width: "100%",
  height: 0,
  marginTop: "10px",
};

const videoStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
};

const MusicPlayer = () => {
  const { currentUser } = useContext(AuthContext);
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        if (currentUser) {
          const q = query(
            collection(db, "userVideos"),
            where("userId", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setTracks(userDoc.data().videos || []);
          } else {
            setTracks([]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nhạc:", error);
      }
    };
    fetchTracks();
  }, [currentUser]);

  return (
    <BootstrapCard className="card-custom">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Kho nhạc
        </Typography>
        <List>
          {tracks.length > 0 ? (
            tracks.map((track, index) => (
              <ListItem key={index} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                <ListItemText primary={track.name} />
                <Box sx={videoContainerStyle}>
                  <ReactPlayer
                    url={track.url}
                    style={videoStyle}
                    width="100%"
                    height="100%"
                    controls
                    onError={() =>
                      toast.error(`Video ${track.name} không khả dụng!`)
                    }
                  />
                </Box>
              </ListItem>
            ))
          ) : (
            <Typography>
              Chưa có nhạc.
            </Typography>
          )}
        </List>
      </CardContent>
    </BootstrapCard>
  );
};

export default MusicPlayer;