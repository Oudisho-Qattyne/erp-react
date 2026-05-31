import type { StorageItem } from "../../domain/entities/FileSystemEntry";
import type { StorageItemDto } from "../dtos/storageItem";


export const mapId2Path = (storageItem: StorageItem): string => {
    let path: string = ''
    if (storageItem.parents_chain.length > 0) {
        const parentPath = storageItem.parents_chain[storageItem.parents_chain.length - 1]
        if(parentPath.path == '/'){
            path =`/${parentPath.name}`
        }
        else{
            path =`${parentPath.path}/${parentPath.name}`
        }
    }
    else {
        path = ''
    }
    path += `/${storageItem.name}`
    return path
}
export const storageItem2StorageItemDto = (storageItem: StorageItem): StorageItemDto => {

    const storageItemDto: StorageItemDto = {
        ...storageItem,
        id: mapId2Path(storageItem),
        type: storageItem.type,
        date: new Date(2023, 11, 1, 14, 45),
        lazy: storageItem.type == "folder",
        size: storageItem.type == "file" ? storageItem.size : 0,
        _id:storageItem.id
    }
    return storageItemDto

}

export const storageItems2StorageItemDtos = (storageItem: StorageItem[]): StorageItemDto[] => {
    const data: StorageItemDto[] = []
    storageItem.forEach((si: StorageItem) => {
        data.push(storageItem2StorageItemDto(si))
        if (si.type == 'folder') {
            si.children?.forEach(sic => [
                data.push(storageItem2StorageItemDto(sic))
            ])
        }
    })
    return data
}