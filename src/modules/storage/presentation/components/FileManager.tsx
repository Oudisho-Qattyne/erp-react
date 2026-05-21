import { Filemanager, Willow } from "@svar-ui/react-filemanager";
import {Locale } from '@svar-ui/react-core'
import "@svar-ui/react-filemanager/all.css";
import {ar } from '../locales/fileManagerComponentLocales/ar'
import {en} from '../locales/fileManagerComponentLocales/en'
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider";
type FileManagerEntity = {
    id: string;
    size: number;
    date: Date;
    type: "folder" | "file";
    parent?: string;
    lazy?:boolean
};



const getLink = (id, download?) =>
    "/direct?id=" + encodeURIComponent(id) + (download ? "&download=true" : "");
  

  const loadData = (id, api) => {
    fetch("/files/" + encodeURIComponent(id))
      .then((res) => res.json())
      .then((data) => {
        api.exec("provide-data", {
          id,
          data,
        });
      });
  };


const rawdata: FileManagerEntity[] = [
    {
        id: "/Code",
        size: 4096,
        date: new Date(2023, 11, 2, 17, 25),
        type: "folder",
    },
    {
        id: "/Music",
        size: 4096,
        date: new Date(2023, 11, 1, 14, 45),
        type: "folder",
    },
    {
        id: "/Info.txt",
        size: 1000,
        date: new Date(2023, 10, 30, 6, 13),
        type: "file",
    },
    {
        id: "/Code/Datepicker/Year.jsx",
        size: 1595,
        date: new Date(2023, 11, 7, 15, 23),
        type: "file",
    },
    {
        id: "/Pictures/162822515312968813.png",
        size: 510885,
        date: new Date(2023, 11, 1, 14, 45),
        type: "file",
        lazy:true
    },
];



const init = (api) => {
    api.on("download-file", (ev) => {
      window.open(getLink(ev.id, true), "_self");
    });

    api.on("open-file", (ev) => {
      window.open(getLink(ev.id ), "_blank");
    });

    api.on("request-data", ({ id }) => loadData(id, api));
  };


//   load data folders when open lazy one

// function loadData({ id }) {
//     fetch("/files?id=" + encodeURIComponent(id))
//       .then((res) => res.json())
//       .then((data) => {
//         // Filemanager exposes actions via the instance API; call exec on ref
//         // apiRef.current.exec("provide-data", { data, id });
//       });
//   }

export default function App() {
    const {language} = useLanguage()
    console.log(language);
  return (
    <Willow>
         <Locale words={language == 'ar' ? ar : en} optional={true}>

      <Filemanager data={rawdata} mode="table"  />
         </Locale>
    </Willow>
  );
}