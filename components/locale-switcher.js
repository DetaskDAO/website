import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export default function LocaleSwitcher() {
  const router = useRouter();

  const { locales, locale: activeLocale } = router;

  const otherLocales = (locales || []).filter(
    (locale) => locale !== activeLocale
  )
  return (
      otherLocales?.map((locale) => {
        const { pathname, query, asPath } = router;
        return (
          <div key={"locale-" + locale}>
            <Link href={{ pathname, query }} as={asPath} locale={locale}>
              {/* <a> */}
              <div className="message">
                <Image src="/img/header_locales.png" alt="" layout="fill" objectFit="cover"  />
              </div>
              {/* </a> */}
            </Link>
          </div>
        );
      })
  );
}
