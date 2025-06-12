'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from "react";
import { KeyboardReact as Keyboard } from "react-simple-keyboard";
import { motion } from "motion/react"

import { Footer } from "@/components/footer/footer";

import 'react-simple-keyboard/build/css/index.css';
import styles from "./page.module.css";
import clear from '@/app/icon-clear.svg';

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
  const [donors, setDonors] = useState(null);
  const [category, setCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDonor, setActiveDonor] = useState(null);
  const keyboard = useRef();

  const keyboardLayout = {
    default: [
      "1 2 3 4 5 6 7 8 9 0 -",
      "q w e r t y u i o p {bksp}",
      "a s d f g h j k l {enter}",
      "z x c v b n m {space}",
    ]
  }
  const keyboardDisplay = {
    '{bksp}': 'DEL',
    '{enter}': 'ENTER',
    '{space}': 'SPACE',
  }

  useEffect(() => {
    async function fetchPosts() {
      let data;
      if (window.electron) {
        data = await window.electron.invoke('fetch-donors');
      } else {
        const res = await fetch('https://holy-birthday-a45fdc80ca.strapiapp.com/api/donors?pagination[page]=1&pagination[pageSize]=3000&sort=DonorName');
        data = await res.json();
      }
      setDonors(data);
    }
    fetchPosts();
  }, []);

  function changeCategory(e) {
    e.preventDefault()
    setCategory(e.target.dataset.category)
  }

  function handleChangeInput(event) {
    const input = event.target.value;
    setSearchQuery(input);
    keyboard.current.setInput(input);
  }
  function handleKeyboardChange(input) {
    setSearchQuery(input);
  }

  function handleKeyboardPress(button) {

  }

  function handleClearInput() {
    setSearchQuery('');
    keyboard.current.setInput('');
  }

  function handleModalOpen(donor) {
    setModalOpen(true);
    setActiveDonor(donor);
  }

  function handleModalClose() {
    setModalOpen(false);
    setActiveDonor(null);
  }

  function renderGivingLevel(level) {
    switch(level[0]) {
      case "4":
        return "$20M+"
        break;
      case "3":
        return "$10M-$19.9M"
        break;
      case "2":
        return "$5M-$9.9M"
        break;
      case "1":
        return "$1M-4.9M"
        break;
      case "0":
      default:
        return "$100K-$999.9K"
        break;
    }
  }

  if (!donors) return null;

  function renderCount(data) {
    if (data) {
      const donorsByCategory = donors.data.filter((donor) => {
        if ((donor.GivingLevel[0] == category || category == null) && donor.DonorName.toLowerCase().includes(searchQuery)) return donor;
      });
      return numberWithCommas(donorsByCategory.length);
    }
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <motion.div
      variants={pageAnimation}
      initial="hidden"
      animate="visible"
      exit="exit">
      <div className="wrapper">
        <div className={styles.grid}>
          <div>
            <label>Search by Category</label>
            <div className={styles.buttonGrid}>
              <button data-category="0" onClick={changeCategory} className={category == 0 && styles.active}>$100,000 &ndash; $999,999</button>
              <button data-category="1" onClick={changeCategory} className={category == 1 && styles.active}>$1,000,000 &ndash; $4,999,999</button>
              <button data-category="2" onClick={changeCategory} className={category == 2 && styles.active}>$5,000,000 &ndash; $9,999,999</button>
              <button data-category="3" onClick={changeCategory} className={category == 3 && styles.active}>$10,000,000 &ndash; $19,999,999</button>
              <button data-category="4" onClick={changeCategory} className={category == 4 && styles.active}>$20,000,000+</button>
              <button data-category={null} onClick={changeCategory} className={category == null && styles.active}>View All</button>
            </div>

            <label>Search by Name</label>
            <div className={styles.searchInputWrapper}>
              <input 
                className={styles.searchInput}
                type="text" 
                placeholder={"Use the keyboard to search by donor name"}
                onChange={handleChangeInput}
                value={searchQuery} />
              <button 
                className={styles.searchInputDelete} 
                onClick={handleClearInput}>
                  <Image src={clear} alt="clear" />
              </button>
            </div>
            <Keyboard
              onChange={handleKeyboardChange}
              onKeyPress={handleKeyboardPress}
              keyboardRef={r => (keyboard.current = r)}
              layout={keyboardLayout}
              display={keyboardDisplay}
              />
          </div>
          <div>
            <h1>{ renderCount(donors) } Donors</h1>

            <div className={styles.donorList}>
              {donors.data.map((donor) => (
                <>
                  { ((donor.GivingLevel[0] == category || category == null) && donor.DonorName.toLowerCase().includes(searchQuery)) && (
                    <div className={styles.donorListItem} key={donor.id} onClick={() => { handleModalOpen(donor.DonorName); }}>
                      <span>{donor.DonorName}</span>
                      <span>{renderGivingLevel(donor.GivingLevel)}</span>
                    </div>
                  )}
                </>
              ))}
            </div>
          </div>
        </div>
        
      </div>
      <Footer />
      {modalOpen && (
        <motion.div 
          variants={pageAnimation}
          initial="hidden"
          animate="visible"
          exit="exit" 
          className={styles.modal} 
          onClick={handleModalClose}>
          <div className={styles.modalContent}>
            <h2>The University of Chicago<br/>Medicine and Biological Sciences<br/>gratefully acknowledges</h2>
            <h3>{activeDonor}</h3>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}