interface indexDataType {
	id: string;
	topic: string;
	isShow: boolean;
	isShowSubject: boolean;
	children: indexDataType[];
	level: number;
}

export type { indexDataType }
