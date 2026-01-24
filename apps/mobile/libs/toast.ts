import Toast from "react-native-toast-message";

export function toastSuccess(msg: string) {
    Toast.show({
        type: "success",
        text1: msg,
    })
}
export function toastError(msg: string) {
    Toast.show({
        type: "error",
        text1: msg,
    })
}

export function toastInfo(msg: string) {
    Toast.show({
        type: "info",
        text1: msg,
    })
}