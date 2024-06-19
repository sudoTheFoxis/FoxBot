#!/bin/bash
clear
echo "============= Bot Launcher =================================="
echo "1 - Run normally"
echo "2 - Run in online updating mode"
echo "============================================================"

function main {
    read -p "Chose: " cho
    if [ "$cho" == "1" ]; then
        dev
    elif [ "$cho" == "2" ]; then
        devwatch
    else
        echo "ERROR unknown chose..."
        main
    fi
}
function dev {
    nice -n 1 npm run dev
    end
}
function devwatch {
    nice -n 1 npm run devwatch
    end
}
function end {
    exit
}

main

#if [ "$cho" == "1" ] || [ "$cho" == "2" ]; then
#    end
#fi
