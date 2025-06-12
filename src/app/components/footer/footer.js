'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation'

import styles from './footer.module.css';
import logo from '@/app/logo.png';

export const Footer = ({ instructions }) => {
  const pathname = usePathname();

  return (
    <footer className={styles.footer}>
      <Image src={logo} alt="Logo" />
      { instructions ? (
        <h1>{instructions}</h1>
      ) : (
        <nav>
          <Link className={`${pathname.indexOf("/stories") == 0 ? styles.active : ''}`} href="/stories">View Stories</Link>
          <Link className={`${pathname === '/donors' ? styles.active : ''}`} href="/donors">View Donors</Link>
          <Link className={`${pathname === '/help' ? styles.active : ''}`} href="/help">How to Help</Link>
        </nav>
      )}
    </footer>
  )
}