import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { statistics } from '@/request/_api/public';
import { HashAvatar } from '@/utils/HashAvatar';
import { useTranslation } from "react-i18next";
import Link from 'next/link';

export default function Home() {
  const { t } = useTranslation();
  
  let [tj, setTj] = useState({});

  useEffect(() => {
    statistics()
    .then(res => {
      if (res) {
        tj = res;
        setTj({...tj})
      }
    })
  },[])

  return (
    <div>
      <Head>
        <title>Detask</title>
        <meta name="description" content="Detask" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className="Index">

          <div className="banner">
            <div className="banner-left">
              <p className="title bg">{t("title")}</p>
              <p className="title mt0" dangerouslySetInnerHTML={{__html: t("title2")}}></p>
              <div className="info">
                <Link href="/publish">
                  <Button className="btn">{t("btn1")}</Button>
                </Link>
                <Link href="/projects">
                  <Button className="btn">{t("btn2")}</Button>
                </Link>
              </div>
            </div>
            <div className="banner-right">
              {/* <Image className="img" src="/banner1.png" alt="" layout="fill" objectFit='cover'/> */}
              <img className="img" src="/banner1.png" alt="" />

              <div className="absolute a1">
                <p className="title">{tj.totalMembers}</p>
                <p className="subtitle">{t("number.members")}</p>
              </div>
              <div className="absolute a2">
                <p className="title">{tj.totalTask}</p>
                <p className="subtitle">{t("number.tasks")}</p>
              </div>
              <div className="absolute a3">
                <p className="title">{tj.totalNFT}</p>
                <p className="subtitle">{t("number.nft")}</p>
              </div>
            </div>
          </div>

          <div className="data">
              <div className="data-li">
                <div className="img">
                  <Image src="/img/index_task.png" alt="" layout="fill" objectFit="cover" />
                </div>
                <p className="title">{t("advantage.security.title")}</p>
                <p className="text">{t("advantage.security.content")}</p>
              </div>
              <div className="data-li">
                <div className="img">
                  <Image src="/img/index_contract.png" alt="" width={57} height={49} />
                </div>
                <p className="title">{t("advantage.credible.title")}</p>
                <p className="text">{t("advantage.credible.content")}</p>
              </div>
              <div className="data-li">
                <div className="img">
                  <Image src="/img/index_nft.png" alt="" layout="fill" objectFit="cover" />
                </div>
                <p className="title">{t("advantage.openness.title")}</p>
                <p className="text">{t("advantage.openness.content")}</p>
              </div>
          </div>

          <div className="ucan">
            <div className="Index-title">
              <div className="img">
                  <Image src="/img/img-index-title.png" alt="" layout="fill" objectFit="cover" />
              </div>
              <p className="font-Title">{t("ucan.title")}</p>
            </div>
            <div className="ucan-list">
              <div className="list-li">
                <div className="li-info">
                  <div className="img">
                  <Image src="/img/img-index-ucan.png" alt="" layout="fill" objectFit="cover" />
                  </div>
                  <p className="title">{t("ucan.item1.title")}</p>
                  <div className="content">
                    {/* <p>Release project requirements and find reliable developers。</p> */}
                    {/* <p>Here, through the developer&apos;s NFT, evaluate the developer&apos;s ability。</p> */}
                    {/* <p>Get project NFT and improve your credibility</p> */}
                    <p>{t("ucan.item1.p1")}</p>
                    <p>{t("ucan.item1.p2")}</p>
                    <p>{t("ucan.item1.p3")}</p>
                    <p>{t("ucan.item1.p4")}</p>
                  </div>
                </div>
              </div>
              <div className="list-li">
                <div className="li-info">
                  <div className="img">
                  <Image src="/img/img-index-ucan.png" alt="" layout="fill" objectFit="cover" />
                  </div>
                  <p className="title">{t("ucan.item2.title")}</p>
                  <div className="content">
                    <p>{t("ucan.item2.p1")}</p>
                    <p>{t("ucan.item2.p2")}</p>
                    <p>{t("ucan.item2.p3")}</p>
                    <p>{t("ucan.item2.p4")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="evaluation">
            <div className="Index-title">
              <div className="img"></div>
              <p className="font-Title">{t("comment.title")}</p>
            </div>
            <div className="evaluation-list">
              <div className="list-li">
                <div className="li-info">
                  <div className="info-img">
                    <img src={HashAvatar("0x351b3A08371bbe04AcCa3711C786C16a91E7222B")} alt="" />
                  </div>
                  <p className="info-name">Kobir</p>
                  <p className="info-role">{t("comment.item1.skill")}</p>
                </div>
                <div className="li-content">
                {t("comment.item1.content")}
                </div>
              </div>

              <div className="list-li">
                <div className="li-info">
                  <div className="info-img">
                    <img src={HashAvatar("0xFB8f64Dc5489ff9997eda9e7CD851F2cf2f6CA28")} alt="" />
                  </div>
                  <p className="info-name">Ray</p>
                  <p className="info-role">{t("comment.item2.skill")}</p>
                </div>
                <div className="li-content">
                {t("comment.item2.content")}
                </div>
              </div>

              <div className="list-li">
                <div className="li-info">
                  <div className="info-img">
                    <img src={HashAvatar("0xeFf6D5227E07729EAe54D696B677720066d6920d")} alt="" />
                  </div>
                  <p className="info-name">Shachar Ventura</p>
                  <p className="info-role">{t("comment.item3.skill")}</p>
                </div>
                <div className="li-content">
                  {t("comment.item3.content")}
                </div>
              </div>

            </div>
            
          </div>

          <div className="h100"></div>
        </div>
      </main>

    </div>
  )
}
