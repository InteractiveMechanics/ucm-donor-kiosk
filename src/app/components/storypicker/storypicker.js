'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import arrow from '@/app/icon-arrow.svg';

import styles from './storypicker.module.css';

export const StoryPicker = ({ storyId, stories, showStories, setShowStories }) => {
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    setPages(Math.ceil(stories.length / 6))
  }, [stories])

  console.log(showStories)

  return (
    <div className={styles.storyPicker + (!showStories ? ' ' + styles.storyPickerOpen : '')}>
      <div 
        className={styles.storyPickerCloseButton} 
        onClick={() => setShowStories(!showStories)}>
          {!showStories ? 'Show Stories' : 'Hide Stories'}
      </div>
      <div className={styles.storyPickerStories}>
        <button onClick={() => { if (page > 1) { setPage(page - 1) } }} className={page > 1 ? styles.storyPaginationButton : styles.storyPaginationButtonDisabled}><Image src={arrow} alt="Previous" /></button>
        <div className={styles.storyPickerStoriesList}>
          {stories.map((story, index) => (
            (index >= (page - 1) * 6 && index < page * 6) && (
              <Link 
                key={story.id} 
                href={'/stories/' + story.id} 
                className={styles.storyListItem + (story.id == storyId ? ' ' + styles.storyListItemActive : '')}>
                <img src={story.ThumbnailImage.url} />
                <p><b>{ story.DonorName }</b></p>
                <p><small>{ story.ShortTitle }</small></p>
              </Link>
            )
          ))}
        </div>
        <button onClick={() => { if (page < pages) { setPage(page + 1) } }} className={page < pages ? styles.storyPaginationButton : styles.storyPaginationButtonDisabled}><Image src={arrow} alt="Next" /></button>
      </div>
    </div>
  )
}