import { Filemanager } from "@svar-ui/react-filemanager";
import "@svar-ui/react-filemanager/all.css";

// Define the exact type expected by the library
type FileManagerEntity = {
    id: string;
    size: number;
    date: Date;
    type: "folder" | "file";
    parent?: string;
};

// Now your data with proper type assertions
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
    },
];

export default function App() {
    return <Filemanager data={rawdata} />;
}