import Head from "next/head";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useWeb3 } from "../../contexts/Web3Context";

export default function Layout({ children, title = "TribeConnect", theme, setTheme }) {
  const { isConnected } = useWeb3();

  return (
    <>
      <Head>
        <title>{title} · TribeConnect</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="description" content="TribeConnect — Decentralised Social Media on XRP Ledger"/>
        <link rel="icon" href="/logo.png"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
      </Head>

      <div className="tc-layout" style={{ display: "flex", minHeight: "100vh" }}>
        {isConnected && <Sidebar />}

        <div className="tc-main" style={{
          flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
          marginLeft: isConnected ? "var(--tc-sidebar-w)" : 0,
        }}>
          <Header theme={theme} setTheme={setTheme}/>
          <main style={{ flex: 1 }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
