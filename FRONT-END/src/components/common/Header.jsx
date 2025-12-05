import { useState } from "react";
export default function Header({ openUserMenu, isAdmin }) {



    return (
        <header className="mx-30">
            <div className="bg-white px-10 pt-10 rounded-b-2xl">
                <div className="flex items-center gap-4 justify-between">
                    <div className="flex  gap-2">

                        <div className="flex gap-2">
                            <img src="./phone icon.svg" alt="" />
                            <div className="flex">
                                <p className="font-medium">8 702 701 5075</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <img src="./email icon.svg" alt="" />
                            <div>
                                <p className="font-medium ">info@maldex.ru</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <img src="./geo icon.svg" alt="" />
                            <div>
                                <p className="font-medium ">Almaty</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-medium ">Мин. сумма заказа от 30 тыс рублей</p>
                    </div>

                    <div className="flex gap-2 mx-5">
                        <div>
                            <p className="font-medium ">Доставка</p>
                        </div>
                        <div>
                            <p className="font-medium ">Оплата</p>
                        </div>
                        <div>
                            <p className="font-medium ">Контакты</p>
                        </div>
                    </div>
                </div>



                <div className="flex items-center  gap-4">
                    <div>
                        <img src="./Maldex logo.svg" alt="" />
                    </div>
                    <div className="">
                        <button className="flex items-center gap-2 bg-[#EC1026] px-6 py-3 rounded-xl">
                            <img src="./catalog in header.svg" alt="" />
                            <div><p className="font-medium text-white">Каталог</p></div>
                        </button>
                    </div>

                    <div>
                        <div className="flex items-stretch w-[980px]  my-10 border-2 border-red-600 rounded-l-lg overflow-hidden relative">
                            {/* Левая часть: Фильтр и Поиск */}
                            <div className="flex flex-grow items-stretch relative bg-white">
                                {/* Фильтр */}
                                <div className="flex-shrink-0 flex items-center px-4 py-2 bg-gray-100 text-gray-800 font-semibold cursor-pointer border-r border-gray-200">
                                    <span>Фильтр</span>
                                    <span className="ml-2 text-xs">▼</span>
                                </div>

                                {/* Поле ввода */}
                                <input
                                    type="text"
                                    placeholder="Поиск"
                                    className="flex-grow px-4 py-2 text-base md:text-lg outline-none relative z-10 bg-transparent"
                                />

                                {/* "Откус" слева от кнопки */}
                                <div
                                    className="absolute  right-[-40px] top-1/2 -translate-y-1/2 w-15 h-15 bg-white z-20 pointer-events-none"
                                    style={{ clipPath: "circle(50% at left center)" }}
                                ></div>
                            </div>

                            {/* Кнопка "Найти" */}
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-8 whitespace-nowrap transition-colors duration-300 relative ">
                                Найти
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="flex flex-col items-center">
                            <img src="./heart.svg" alt="" />
                            <p className="font-medium ">Избранное</p>
                        </div>
                        <div
                            onClick={() => {
                                if (localStorage.getItem('role') === 'admin' || localStorage.getItem('email') === '123@gmail.com') {
                                    isAdmin();
                                }
                                else {
                                    openUserMenu();
                                }
                            }}
                            className="flex flex-col items-center cursor-pointer"
                        >
                            <img src="./union.svg" alt="" />
                            <p className="font-medium">Кабинет</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <img src="./korz.svg" alt="" />
                            <p className="text-[#F1107E] font-medium ">14 619 ₽ </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
