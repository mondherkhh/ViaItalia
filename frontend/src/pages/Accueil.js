import { GlobalStyle } from "../globalStyles";

import { lazy, Suspense } from "react";



const Home = lazy(() => import("./Home"));

const Header = lazy(() => import("../components/header/index"));

const Footer = lazy(() => import("../components/footer/index"));

const ScrollToTop = lazy(() => import("../components/scrollTotop/index"));



function Accueil() {

  return (

    <>

   <Suspense fallback={null}>

        <GlobalStyle />

        {/* Hi There! */}

        <Header />

        <Home />

        <Footer />

        <ScrollToTop />

      </Suspense>

    </>

  );

}



export default Accueil;