import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import "./App.css";
import { FirebaseProvider } from "./FirebaseProvider";
import { TerpLinkMap } from "./TerpLinkMap";

const theme = createTheme({
  palette: {
    primary: {
      main: "#F44336",
    },
    secondary: {
      main: "#FFC107",
    },
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <div className="App">
          <FirebaseProvider>
            <TerpLinkMap />
          </FirebaseProvider>
        </div>
      </CssBaseline>
    </ThemeProvider>
  );
}

export default App;
