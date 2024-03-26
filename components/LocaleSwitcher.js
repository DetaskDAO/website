import Image from "next/image";
import i18n from 'i18next';


export default function LocaleSwitcher() {
  // const {
  //   label, // current locale label
  //   options, // the option list of other locales
  // } = useLocaleSwitcher({ localeMap });
  return (
    <div>
      
              <div className="message"
                onClick={() => {
                  let lang = i18n.language === 'zh' ? 'en' : 'zh';
                  i18n.changeLanguage(lang);
                  localStorage.setItem("detask.lang", lang)
                }}
              >
                <Image src="/img/header_locales.png" alt="" layout="fill" objectFit="cover"  />
              </div>
    </div>
  );
}
