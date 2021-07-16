import Head from 'next/head'
// import Image from 'next/image'
import styles from '../styles/Home.module.css'

import LayoutComponent from '../components/LayoutComponent';

export default function Home() {
  return (
    <LayoutComponent title="page title" page="top" content={<>
      <p>page content</p>
    </>}/>
  )
}
