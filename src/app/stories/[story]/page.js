"use client"

import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion } from "motion/react"
import Markdown from 'markdown-to-jsx'

import { Footer } from "@/components/footer/footer";
import { StoryPicker } from "@/components/storypicker/storypicker";
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
  const pathname = usePathname();
  const sid = pathname.split("/")[2];

  const [showStories, setShowStories] = useState(false)
  const [story, setStory] = useState(null)
  const [stories, setStories] = useState(null)
  const [images, setImages] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)

  useEffect(() => {
    async function fetchPosts() {
      // Use window.electron if in Electron, fallback to fetch if in browser
      let data;
      if (window.electron) {
        data = await window.electron.invoke('fetch-stories');
      } else {
        const res = await fetch('https://holy-birthday-a45fdc80ca.strapiapp.com/api/stories?populate=*&pagination[page]=1&pagination[pageSize]=200');
        data = await res.json();
      }
      
      setStory(data.data.find(story => story.id == sid));
      setStories(data.data);
      setImages(data.data.find(story => story.id == sid).Images);
      setCurrentImage(data.data.find(story => story.id == sid).Images[0]);
    }
    fetchPosts();
    setShowStories(false);
  }, []);

  if (!story) return null;

  return (
    <motion.div
      variants={pageAnimation}
      initial="hidden"
      animate="visible"
      exit="exit">
      <main className={styles.storyLayout}>
        <div className={styles.storyLayoutLeft}>
          <div className={styles.storyImageViewer}>
            <img 
              src={ currentImage.url } 
              alt={ currentImage.alternativeText }
              width={ currentImage.width }
              height={ currentImage.height } />
          </div>
          { currentImage.caption && (
            <div className={styles.storyImageViewerCaption}>
              <p>{ currentImage.caption }</p>
            </div>
          )}
          <div className={styles.storyImageViewerThumbnails}>
              {images.map((image) => (
                <div 
                  key={image.id}
                  className={styles.storyImageViewerThumbnail}
                  onClick={() => setCurrentImage(image)}>
                    <img 
                      className={currentImage.id == image.id ? styles.storyImageViewerThumbnailActive : ''}
                      src={ image.url } 
                      alt={ image.alternativeText } />
                </div>
              ))}
            </div>
        </div>
        <div className={styles.storyLayoutRight}>
          <h1>{ story.FullTitle }</h1>
          <div className={styles.scrollable}><Markdown>{ story.BodyCopy }</Markdown></div>
        </div>
      </main>
      <StoryPicker storyId={sid} stories={stories} showStories={showStories} setShowStories={setShowStories} />
      <Footer></Footer>
    </motion.div>
  );
}