'use client';

import Markdown from 'markdown-to-jsx'
import { useState, useEffect } from "react";
import Link from 'next/link';
import { motion } from "motion/react"
import Image from 'next/image';

import { Footer } from "@/components/footer/footer";
import styles from "./page.module.css";
import arrow from '@/app/icon-arrow.svg';

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
  const [stories, setStories] = useState(null)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    async function fetchPosts() {
      // Use window.electron if in Electron, fallback to fetch if in browser
      let data;
      if (window.electron) {
        data = await window.electron.invoke('fetch-stories');
      } else {
        const res = await fetch('http://localhost:1337/api/stories?populate=*&pagination[page]=1&pagination[pageSize]=200');
        data = await res.json();
      }
      
      setStories(data)
      setPage(1)
      setPages(Math.ceil(data.data.length / 6))
    }
    fetchPosts()
  }, [])

  if (!stories) return null;

  return (
    <motion.div
      variants={pageAnimation}
      initial="hidden"
      animate="visible"
      exit="exit">
      <div className="wrapper">
        <div className={styles.storyList}>
          {stories.data.map((story, index) => (
            (index >= (page - 1) * 6 && index < page * 6) && (
              <Link href={'/stories/' + story.id} className={styles.storyListItem} key={story.id}>
                <img src={'http://localhost:1337' + story.ThumbnailImage.url} />
                <p><b>{ story.DonorName }</b></p>
                <p><small>{ story.ShortTitle }</small></p>
              </Link>
            )
          ))}
        </div>
        <div className={styles.storyPagination}>
          <button onClick={() => { if (page > 1) { setPage(page - 1) } }} className={page > 1 ? styles.storyPaginationButton : styles.storyPaginationButtonDisabled}><Image src={arrow} alt="Previous" /></button>
          <span>Page {page} of {pages}</span>
          <button onClick={() => { if (page < pages) { setPage(page + 1) } }} className={page < pages ? styles.storyPaginationButton : styles.storyPaginationButtonDisabled}><Image src={arrow} alt="Next" /></button>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}