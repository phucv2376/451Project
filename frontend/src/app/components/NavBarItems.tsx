

type Props = {
    alt: string;
    label: string;
    Icon: any;
    onClick?: any;

}

const NavBarItems = (props: Props) => {
    return (
        <h2
            className="cursor-pointer my-2 flex items-center gap-2 px-3 py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            onClick={props.onClick}
        >
            <props.Icon />
            {props.label}
        </h2>
    )
}

export default NavBarItems