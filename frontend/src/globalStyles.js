import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`

:root{
   --background: #f1f3f2;
   --page-background: #f1f3f2;
   --black:#111111;
   --purple:#138A5B;
   --pink:#C9343E;
   --white:#fff;
   --nav:#ffffff;
   --nav2:#eef1ef;
   --green:#138A5B;
   --red:#C9343E;
   --surface:#ffffff;
   --surface-muted:#eef1ef;
   --text:#111111;
   --text-muted:#4B5563;
   --border:rgba(17,17,17,0.14);
   --edge-fade: rgba(241,243,242,0.96);
   --notebook-line: rgba(32,33,36,0.075);
}

:root[data-theme="dark"]{
   --background:#0d1118;
   --page-background:#0b1017;
   --black:#f8fafc;
   --white:#f8fafc;
   --nav:rgba(24,31,39,0.9);
   --nav2:rgba(31,42,52,0.82);
   --surface:rgba(29,36,44,0.84);
   --surface-muted:rgba(34,45,55,0.78);
   --text:#f8fafc;
   --text-muted:#cbd5e1;
   --border:rgba(255,255,255,0.18);
   --edge-fade:rgba(11,16,23,0.96);
   --notebook-line:rgba(255,255,255,0.085);
}


*,*::before,*::after{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family: 'Poppins', sans-serif;
}
html{
  ${"" /* overflow-y: scroll; */}
  scroll-behavior:smooth;
  
}
    body,
    html,
    a {
        font-family: 'Poppins', sans-serif;
            }
    body {

        margin:0;
        padding:0;
        border: 0;
        outline: 0;
        background: var(--page-background);
        color: var(--text);
        min-height: 100vh;
        transition: background-color 220ms ease, color 220ms ease;

        overflow-x: hidden;
    }

    html[data-theme="dark"],
    body.theme-dark {
        color-scheme: dark;
    }

    body.theme-dark {
        background:
          radial-gradient(circle at 0% 0%, rgba(19, 138, 91, 0.16), transparent 34%),
          radial-gradient(circle at 100% 0%, rgba(201, 52, 62, 0.14), transparent 34%),
          linear-gradient(135deg, #091312 0%, #0e141d 52%, #140d12 100%);
    }

    body.theme-dark #root {
        background: transparent;
    }

    body.theme-dark input,
    body.theme-dark textarea,
    body.theme-dark select {
        background: var(--surface);
        color: var(--text);
        border-color: var(--border);
    }

    body.theme-dark input::placeholder,
    body.theme-dark textarea::placeholder {
        color: var(--text-muted);
        opacity: 0.82;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        margin:0;
        padding:0;
    }
    a {

        text-decoration: none;
        outline: none;
    }
    button{
        border:none;
        outline:none;
        &:focus{
            outline:none;
        }
    }

    *:focus {
        outline: none;
    }

    img,svg{
        width:100%;
        height:auto;
    }


`;

//  /* Colors */