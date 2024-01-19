#!/bin/bash
# Global variables
BOOK=~/.databook
export BOOK

confirm()
{
  echo -en "$@"
  read ans
  ans=`echo $ans | tr '[a-z]' '[A-Z]'`
  if [ "$ans" == "Y" ]; then
    return 0
  else
    return 1
  fi
}

num_lines()
{
  grep -i "$@" $BOOK|wc -l| awk '{ print $1 }'
}

find_lines()
{
  # Find lines matching $1
  res=-1
  if [ ! -z "$1" ]; then
    grep -i "$@" $BOOK
    res=$?
  fi
  return $res
}

list_items()
{
  # List items matching given search criteria
  if [ "$#" -eq "0" ]; then
    echo -en "Enter your Name "
    read search
    if [ -z "$search" ]; then
      search="."
    fi
    echo
  else
    search="$@"
  fi
  find_lines "${search}" | while read i
  do
    echo "$i" | tr ':' '\t'
  done
  echo -en "Matches found: "
  num_lines "$search"
}

add_item()
{
  echo "Add Item: You will be prompted for 3 items:"
  echo "  - Name, Phone, Email."
  echo
  echo -en "Name: "
  read name
  find_lines "^${name}:"
  if [ `num_lines "^${name}:"` -ne "0" ]; then
    echo "Sorry, $name already has an entry."
    return
  fi
  echo -en "Phone: "
  read phone
  echo -en "Email: "
  read email
  # Confirm
  echo "${name}:${phone}:${email}" >> $BOOK
}

locate_single_item()
{
  echo -en "Item to search for: "
  read search
  n=`num_lines "$search"`
  if [ -z "$n" ]; then
    n=0
  fi
  while [ "${n}" -ne "1" ]; do
    #list_items "$search"
    echo -en "${n} matches found. Please choose a "
    case "$n" in 
      "0") echo "less" ;;
      "*") echo "more" ;;
    esac
    echo "specific search term (q to return to menu): "
    read search
    if [ "$search" == "q" ]; then
      return 0
    fi
    n=`num_lines "$search"`
  done
  return `grep -in $search $BOOK |cut -d":" -f1`
}

remove_item()
{
  locate_single_item
  search=`head -$? $BOOK | tail -1|tr ' ' '.'`
  if [ -z "${search}" ]; then
	return
  fi
  list_items "$search"
  confirm "Remove?"
  if [ "$?" -eq "0" ]; then
    grep -v "$search" $BOOK > ${BOOK}.tmp ; mv ${BOOK}.tmp ${BOOK}
  else
    echo "NOT REMOVING"
  fi
}

edit_item()
{
  locate_single_item
  search=`head -$? $BOOK | tail -1|tr ' ' '.'`
  if [ -z "${search}" ]; then
	return
  fi
  list_items "$search"
  thisline=`grep -i "$search" $BOOK`
  oldname=`echo $thisline|cut -d":" -f1`
  oldphone=`echo $thisline|cut -d":" -f2`
  oldemail=`echo $thisline|cut -d":" -f3`
  echo "SEARCH : $search"
  grep -v "$search" $BOOK > ${BOOK}.tmp ; mv ${BOOK}.tmp ${BOOK}
  echo -en "Name [ $oldname ] "
  read name
  if [ -z "$name" ]; then
    name=$oldname
  fi
  find_lines "^${name}:"
  if [ `num_lines "^${name}:"` -ne "0" ]; then
    echo "Sorry, $name already has an entry."
    return
  fi
  echo -en "Phone [ $oldphone ] "
  read phone
  if [ -z "$phone" ]; then
    phone=$oldphone
  fi
  echo -en "Email [ $oldemail ] "
  read email
  if [ -z "$email" ]; then
    email=$oldemail
  fi
  echo "${name}:${phone}:${email}" >> $BOOK
}

show_menu()
{
  # Called by do_menu
  echo "-------------- Address Book ---------------"
  echo "1. List / Search"
  echo "2. Add"
  echo "3. Edit"
  echo "4. Remove"
  echo "q. Quit"
  echo -en "Enter your selection: "
}

do_menu()
{
  i=-1

  while [ "$i" != "q" ]; do
    show_menu
    read i
    i=`echo $i | tr '[A-Z]' '[a-z]'`
    case "$i" in 
	"1")
	list_items
	;;
	"2")
	add_item
	;;
	"3")
	edit_item
	;;
	"4")
	remove_item
	;;
	"q")
	# Ought to confirm before quitting!
	echo "Bye Bye"
	exit 0
	;;
	*)
	echo "Unrecognised input."
	;;
    esac
  done
}

##########################################################
############ Main script starts here #####################
##########################################################

if [ ! -f $BOOK ]; then
  echo "Creating $BOOK ..."
  touch $BOOK
fi

if [ ! -r $BOOK ]; then
  echo "Error: $BOOK not readable"
  exit 1
fi

if [ ! -w $BOOK ]; then
  echo "Error: $BOOK not writeable"
  exit 2
fi

do_menu



