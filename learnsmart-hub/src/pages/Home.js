import PageLayout from "../components/PageLayout";
import { Typography, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <PageLayout>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
        textAlign="center"
      >
        <Typography variant="h3" gutterBottom>
          Chào mừng đến với LearnSmart Hub!
        </Typography>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Nền tảng hỗ trợ học tập thông minh dành cho bạn.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/timer"
          sx={{ mt: 2 }}
        >
          Đi đến Bộ đếm ngược
        </Button>
        <Button
          variant="outlined"
          color="primary"
          component={Link}
          to="/study-methods"
          sx={{ mt: 2, ml: 2 }}
        >
          Xem Phương pháp học
        </Button>
      </Box>
    </PageLayout>
  );
};

export default Home;