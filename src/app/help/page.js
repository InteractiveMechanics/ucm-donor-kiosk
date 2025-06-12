'use client';

import Markdown from 'markdown-to-jsx'
import { useState, useEffect } from "react";
import { motion } from "motion/react"

import { Footer } from "@/components/footer/footer";

import styles from "./page.module.css";

export const pageAnimation = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Home() {
  const [help, setHelp] = useState(null)

  useEffect(() => {
    async function fetchPosts() {
      let data;
      if (window.electron) {
        data = await window.electron.invoke('fetch-help');
      } else {
        const res = await fetch('https://holy-birthday-a45fdc80ca.strapiapp.com/api/how-to-give?populate=*');
        data = await res.json();
      }
      setHelp(data);
    }
    fetchPosts();
  }, []);

  function buildContent(el) {
    let type = el.type;
    let text = el.children[0].text;

    if (type == "heading"){ return <h2>{text}</h2> }
    if (type == "paragraph"){ return <p>{text}</p> }
  }

  if (!help) return null;
  
  return (
    <motion.div
      variants={pageAnimation}
      initial="hidden"
      animate="visible"
      exit="exit">
      <div className="wrapper">
        <h1>How To Give</h1>
        <div className={styles.grid}>
          <div>
            <Markdown>{ help.data.Column1 }</Markdown>
          </div>
          <div>
            <Markdown>{ help.data.Column2 }</Markdown>
          </div>
          <div>
            <Markdown>{ help.data.Column3 }</Markdown>
            <div className={styles.qrcodeBlock}>
              { help.data.QRCode.url && (<img className={styles.qrcode} src={help.data.QRCode.url} />)}
              { help.data.QRCodeCaption && (<p className={styles.caption}>{help.data.QRCodeCaption}</p>)}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}