"""Unit tests for functions in helpers.py"""

from datetime import date
from scripts.helpers import parse_date

"""Unit tests for the parse_date function in helpers.py"""


def test_parse_date_mm_dd_yyyy():
    assert parse_date("10/05/2025") == date(2025, 10, 5)


def test_parse_date_month_day_year():
    assert parse_date("October 5, 2025") == date(2025, 10, 5)


def test_parse_date_weekday_month_day_year():
    assert parse_date("Sunday, October 5, 2025") == date(2025, 10, 5)


def test_parse_date_mon_dd_yyyy_hh_mm_ss_am_pm_tz():
    assert parse_date("Oct 5, 2025 12:00:00 AM EDT") == date(2025, 10, 5)


def test_parse_date_yyyy_mm_dd_hh_mm_ss():
    assert parse_date("2025-10-05-00-00-00") == date(2025, 10, 5)


def test_parse_date_invalid_date():
    assert parse_date("Invalid Date") is None


def test_parse_date_empty_string():
    assert parse_date("") is None
