'use client';

import { motion } from "motion/react"
import { useState, useEffect } from "react";
import Link from 'next/link';
import styles from "./page.module.css";

import { Footer } from "@/components/footer/footer";

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
  const [donors, setDonors] = useState(null)
  const [donorCount, setDonorCount] = useState(null);
  const [elements, setElements] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      let data;
      if (window.electron) {
        data = await window.electron.invoke('fetch-donors');
      } else {
        const res = await fetch('http://localhost:1337/api/donors?pagination[page]=1&pagination[pageSize]=3000&sort=DonorName');
        data = await res.json();
      }
      setDonors(data);
      setDonorCount(data.data.length);
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setElements((prevElements) => {
        if (prevElements.length < 40) {
          return [...prevElements, (renderDonorName())];
        } else {
          return prevElements.slice(1);
        }
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, [donors]);

  function renderDonorName() {
    const randomDonor = Math.floor(Math.random() * donorCount);
    const randomY = Math.floor(Math.random() * 920);
    const randomSide = Math.floor(Math.random() * 2);
    const randomDuration = Math.floor(Math.random() * (120 - 90 + 1)) + 90;

    const exitAnimation = {
      start: {
        translateX: (randomSide ? (1920 * 1.5) : -1920),
        translateY: randomY,
        transition: {
          duration: randomDuration,
          ease: "easeInOut"
        },
      },
      exit: {
        translateX: (randomSide ? -1920 : (1920 * 1.5)),
        translateY: randomY,
        transition: {
          duration: randomDuration,
          ease: "easeInOut"
        },
      },
    };

    return (
      <motion.span 
        key={randomDonor} 
        variants={exitAnimation}
        initial="start"
        animate="exit"
        exit="exit"
        className={styles.donor + ` donor-${donors.data[randomDonor].GivingLevel[0]} ${randomDuration && "donor-flip"}`}>
          {donors.data[randomDonor].DonorName}
      </motion.span>
    )
  }

  if (!donors) return null;

  return (
    <motion.div
      variants={pageAnimation}
      initial="hidden"
      animate="visible"
      exit="exit">
      <Link className={styles.page} href="/stories">
        <div id="attractWrapper" className={styles.attract}>
          {elements}
        </div>
      </Link>
      <Footer instructions="Touch Screen to Begin"></Footer>
    </motion.div>
  );
}
