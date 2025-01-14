
import "./index.css";
import Card from '@/components/card';
import { CardProps } from '@/types/cardTypes';
import { MouseEvent, useMemo, useState } from 'react';



function CardList(list: CardProps[]) {
    return list.map((card) => {
        return (<Card card={card} />)
    })
}

let dragging = false;
let cloneCard: HTMLElement | null = null;
let offsetX = 0, offsetY = 0;
let middle = 0;
let cardAttrs = {};
export default function DraggingArea() {
    let letter = 'A';
    const initialCard = (num: number) => new Array(num).fill(0).map(() => {
        const newCard = { name: `Task ${letter}`, id: `card-${letter}` };
        letter = String.fromCharCode(letter.charCodeAt(0) + 1);
        return newCard;
    });

    // 初始化卡片列表
    const [twoColumns, setTwoColumns] = useState([initialCard(3), initialCard(2)]);
    const [leftList, rightList] = useMemo(
        () => {
            return [formatList(twoColumns[0]), formatList(twoColumns[1])]
        },
        [twoColumns]
    );


    // 拖拽开始
    function start(e: MouseEvent<HTMLElement>) {
        const ele = e.target as HTMLElement; // 拖拽的卡片
        if (ele && ele.id.startsWith('card-')) {
            cloneCard = ele.cloneNode(true) as HTMLElement; // 克隆出跟随鼠标移动的卡片
            dragging = true;
            offsetX = e.clientX - ele.offsetLeft;
            offsetY = e.clientY - ele.offsetTop;
            // 初始化移动卡片属性
            if (cloneCard) {
                cloneCard.dataset.id = ele.id;
                cloneCard.id = "card-dragging"
                cloneCard.style.cssText = `left: ${ele.offsetLeft}px; top: ${ele.offsetTop}px`;
                cloneCard.classList.add('dragging');
                document.getElementById('dragging-area')?.appendChild(cloneCard);
                cardAttrs = cloneCard.getBoundingClientRect();
            }
            updateCards(twoColumns, ele.id);
            middle = document.querySelector('.split-line')?.getBoundingClientRect().x ?? 0;
        }
    }

    // 拖拽中
    function move(e: MouseEvent<HTMLElement>) {
        // 拖动过程中更新移动卡片的坐标
        if (dragging && cloneCard) {
            const y = e.clientY - offsetY;
            cloneCard.style.cssText = `left: ${e.clientX - offsetX}px; top: ${y}px`;
            // 原始卡片
            const draggingCard: CardProps | undefined = [...leftList, ...rightList].find(card => card.id === cloneCard?.dataset.id);
            if (draggingCard) {
                const { id } = draggingCard;
                // 卡片当前拖拽高度
                draggingCard.top = y;
                // 从两列中加原始卡片剔除
                const newColumns: CardProps[][] = [leftList.filter(c => c.id !== id), rightList.filter(c => c.id !== id)]
                // 根据鼠标位置将卡片推入对应列
                if (e.clientX < middle) {
                    newColumns[0].push(draggingCard)
                } else {
                    newColumns[1].push(draggingCard)
                }
                updateCards(newColumns, id);
            }

        }
    }

    // 拖拽结束
    function end() {
        cloneCard && cloneCard.remove();
        cloneCard = null;
        dragging = false;
        updateCards();
    }

    // 更新卡片列表
    function updateCards(columns: CardProps[][] = twoColumns, id: string = "") {
        const getCardsWithTop = (cards: CardProps[], draggingId: string = "") => {
            return cards.map(card => {
                // 拖拽卡片的top值采用传入值，其他卡片的top值采用当前元素在窗口中y坐标
                return { top: document.getElementById(card.id)?.getBoundingClientRect().y, ...card, isDragging: card.id === draggingId }
            })
        };
        setTwoColumns([getCardsWithTop(columns[0], id), getCardsWithTop(columns[1], id)]);
    }

    // 卡片列表排序
    function formatList(list: CardProps[]) {
        list.sort((a: CardProps, b: CardProps) => (a.top ?? 0) - (b.top ?? 0));
        return list.map(({ id, name, isDragging }) => {
            return { id, name, isDragging };
        });
    }


    return (
        <div id="dragging-area" className="content" onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onBlur={end}>
            <div className="list-area">
                {
                    CardList(leftList)
                }
            </div>
            <div className="split-line" />
            <div className="list-area">
                {
                    CardList(rightList)
                }
            </div>
        </div>
    );
}
